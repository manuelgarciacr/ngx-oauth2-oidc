import { ChangeDetectionStrategy, Component, Pipe, PipeTransform, computed, effect, inject, signal, type OnInit } from "@angular/core";
import { Oauth2Service, IOAuth2Config, authorizationGrantType, IOAuth2Parameters } from "ngx-oauth2-oidc";
import webAppConfig  from "../../../public/google-web-app.config.json";
import desktopConfig from "../../../public/google-desktop.config.json";
import { FormsModule } from "@angular/forms"
import { SlicePipe, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { JOSEError } from "jose/errors";

@Pipe({
    name: "json4",
    standalone: true
})
export class Json4Pipe implements PipeTransform {
    transform(val: any) {
        const ordered = (unordered?: object | null) => Object.keys(unordered ?? {})
            .sort()
            .reduce((obj, key) => {
                const newKey = key as keyof typeof obj;
                //if (!unordered) return obj;
                (obj[newKey] as unknown) = unordered![newKey];
                return obj;
            }, {});
        if (val) {
            const newVal = val as IOAuth2Config;
            const parms = ordered(newVal.parameters);
            val.parameters = parms
        }
        return JSON.stringify(val, null, 4);
    }
}

@Component({
    standalone: true,
    templateUrl: "login.component.html",
    imports: [FormsModule, SlicePipe, Json4Pipe, NgIf],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "container-fluid row mt-3" },
    styles: [
        "fieldset {background-color: lightsalmon}",
        "legend {background-color: peru}",
    ],
})
export class LoginComponent implements OnInit {
    private readonly oauth2 = inject(Oauth2Service);
    private _working = signal(false);
    private count = 0;
    protected readonly working = this._working.asReadonly();
    protected readonly api = signal("google-web-app");
    protected readonly client_id = signal("");
    protected readonly client_secret = signal("");
    protected readonly grant = signal("code");
    protected readonly code = signal(true);
    protected readonly token = signal(false);
    protected readonly id_token = signal(false);
    protected readonly config = signal(<IOAuth2Config>{});
    protected readonly textModified = signal(false);
    protected readonly response = signal<[string, any][]>([]);
    protected readonly token_response = signal<[string, any][]>([]);
    protected readonly idTokenVerification = signal<[string, any][]>([]);
    protected readonly response_type = computed(() => {
        const val = [];
        this.code() && val.push("code");
        this.token() && val.push("token");
        this.id_token() && val.push("id_token");
        return val.length ? val.join(" ") : "none";
    });
    protected readonly configError = signal("");
    private effect = effect(
        () => {
            this.count++;
            if (this.count > 100) {
                console.log("EFFECT CANCEL");
                this.effect.destroy();
            }

            const config = JSON.parse(
                sessionStorage.getItem("cf") ?? "{}"
            ) as IOAuth2Config;
            const oldApi = config?.configuration?.tag;
            const oldGrant = config?.configuration?.authorization_grant;

            // API CREDENTIALS

            const api = this.api();
            const newCfg = (
                oldApi == api
                    ? config
                    : api == "google-web-app"
                    ? webAppConfig
                    : api == "google-desktop"
                    ? desktopConfig
                    : config
            ) as IOAuth2Config; // custom
            newCfg.configuration!.tag = api;

            if (oldApi != api) this.textModified.set(false);
            // CUSTOM CREDENTIALS

            const client_id = this.client_id();
            const client_secret = this.client_secret();

            if (api == "custom") {
                newCfg.parameters!.client_id = client_id;
                newCfg.parameters!.client_secret = client_secret;
            }

            // AUTHORIZATION GRANT TYPE

            const grant = this.grant() as authorizationGrantType;

            if (oldGrant == grant) null;
            else if (grant == "code") {
                this.code.set(true);
                this.token.set(false);
                this.id_token.set(false);
            } else if (grant == "implicit") {
                this.code.set(false);
                this.token.set(true);
                this.id_token.set(false);
            }
            newCfg.configuration!.authorization_grant = grant;

            // RESPONSE TYPE

            // if (id_token) {
            //     newCfg.configuration.authorization_params!.push("nonce");
            // }

            //if (resTyp == "none") cfg.configuration.authorization_params["include_granted_scopes"];

            sessionStorage.setItem("cf", JSON.stringify(newCfg));
            this.config.set(newCfg);
            //console.log("RESTYP", rt);
        },
        { allowSignalWrites: true }
    );

    async ngOnInit() {
        this.getParameters();

        const params = await this.oauth2.interceptor();
        // The code is not saved in the sessionStorage, but in the
        //      internal configuration of the service. If the service
        //      is destroyed (for example, by redirecting the web page),
        //      you should save it somewhere.
        const code = params.code;
        const id_token = (params as IOAuth2Parameters & {id_token: string}).id_token;

        console.log("PARAMS", params, window.location);
        this.response.set(Object.entries(params));

        /* if (code) {
            try {
                // const tag = this.oauth2Service.config?.tag ?? "";
                // const id = this.oauth2Service.config?.parameters.client_id
                // const reqId = id?.substring(13, 17);
                // const res = await lastValueFrom(
                //     this.repo.clientSecret(tag, reqId ?? "xxxx")
                // );
                // const b64 = res.data ? res.data[0] : "";
                // const client_secret = Buffer.from(b64, "base64").toString(
                //     "utf-8"
                // );
                const client_secret = undefined;
                const resp1 = await this.oauth2Svc.token(code, client_secret);

                //const refresh_token = this.oauth2Service.config?.parameters.refresh_token
                const resp2 = resp1?.refresh_token
                    ? await this.oauth2Svc.refresh(client_secret)
                    : undefined;

                const resp3 = resp1?.id_token
                    ? await this.oauth2Svc.id_token_verify()
                    : undefined;

                console.log("TOKEN", client_secret, resp1, resp2, resp3);
            } catch (err) {
                console.error(err);
            }
        } */

        if (code) {
            this.accessToken().catch()
        }
        // Some flows respond to the redirect with an id_token
        if (id_token) {
            try {
                const resp = await this.oauth2.verify_token();
                this.idTokenVerification.set(Object.entries(resp));
            } catch (err) {
                console.log(
                    "ID_TOKEN ERR",
                    (err as Error).name,
                    (err as Error).message
                );
                this.idTokenVerification.set([
                    [(err as Error).name, (err as Error).message],
                ]);
            }
        }
        window.history.replaceState({}, "", window.location.pathname);
    }

    protected setConfig = (s: string) => {
        try {
            const obj = JSON.parse(s);
            this.configError.set("");
            console.log("SETCONFIG", obj);
            sessionStorage.setItem("cf", JSON.stringify(obj));
            this.config.set(obj);
            this.textModified.set(true);
        } catch (err) {
            if (err instanceof SyntaxError) this.configError.set(err.message);
            console.log("SETCONFIG ERR", err);
        }
    };

    private saveParameters = (): void => {
        const api = this.api();
        const client_id = this.client_id();
        const client_secret = this.client_secret();
        const grant = this.grant();
        const code = this.code();
        const token = this.token();
        const id_token = this.id_token();
        const textModified = this.textModified();

        sessionStorage.setItem(
            "pr",
            JSON.stringify({
                api,
                client_id,
                client_secret,
                grant,
                code,
                token,
                id_token,
                textModified,
            })
        );
    };

    private getParameters = () => {
        const sample = sessionStorage.getItem("pr");

        if (sample) {
            const object = JSON.parse(sample);
            this.api.set(object.api);
            this.client_id.set(object.client_id);
            this.client_secret.set(object.client_secret);
            this.grant.set(object.grant);
            this.code.set(object.code);
            this.token.set(object.token);
            this.id_token.set(object.id_token);
            this.textModified.set(object.textModified);
        }
    };

    protected google = async () => {
        if (this.working()) return;
        this._working.set(true);

        this.saveParameters();
        this.response.set([]);
        this.token_response.set([]);
        this.idTokenVerification.set([]);

        try {
            this.oauth2.setConfig(this.config());

            await this.oauth2.fetchDiscoveryDoc();
            await this.oauth2.authorization();
        } catch (err) {
            console.error(err);
        } finally {
            this._working.set(false);
        }
    };

    protected accessToken = async () => {
        if (this.working()) return;
        this._working.set(true);

        try {
            const res = await this.oauth2.token({
                //client_secret: this.client_secret(),
            });
            this.token_response.set(Object.entries(res ?? {}));

            // Some flows respond with an id_token

            if ((res as IOAuth2Parameters & {id_token: string})?.id_token) {
                const resp = await this.oauth2.verify_token();
                this.idTokenVerification.set(Object.entries(resp));
            }
        } catch (err) {
            console.error(err);

            const isJOSEError = err instanceof JOSEError;
            const isHttpError = err instanceof HttpErrorResponse;
            const error: [string, any][] = isHttpError
                ? [[err.error.error, err.error.error_description]]
                : isJOSEError
                ? [[(err as Error).name, (err as Error).message]]
                : [[(err as Error).cause, (err as Error).message]];

            if (this.response().length) {
                // Token request Ok. Verification error
                this.idTokenVerification.set(error);
            } else {
                // Token request error
                this.token_response.set(error);
            }
        } finally {
            this._working.set(false);
        }
    };
}


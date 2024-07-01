import { ChangeDetectionStrategy, Component, Pipe, PipeTransform, WritableSignal, computed, effect, inject, signal, type OnInit } from "@angular/core";
import { Oauth2Service, IOAuth2Config, IOAuth2Parameters } from "ngx-oauth2-oidc";
import webAppConfig  from "../../../public/google-web-app.config.json";
import desktopConfig from "../../../public/google-desktop.config.json";
import webAppConfigSecret from "../../../public/google-web-app.secret.json";
import desktopConfigSecret from "../../../public/google-desktop.secret.json";
import { FormsModule } from "@angular/forms"
import { SlicePipe, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { JOSEError } from "jose/errors";
import { customParametersType } from "../../../../ngx-oauth2-oidc/src/domain";
import { cfgScope } from "./_cfgScope";
import { cfgResponse } from "./_cfgResponseType";
import { cfgAuthGoogle } from "./_cfgAuthGoogle";
import { cfgGrant } from "./_cfgGrant";
import { cfgOptions } from "./_cfgOptions";
import { saveParameters } from "./_saveParameters";
import { getParameters } from "./_getParameters";

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
    // configuration object example
    protected readonly api = signal("google-web-app");
    // credentials
    protected readonly client_id = signal("");
    protected readonly client_secret = signal("");
    protected readonly redirect_uri = signal(
        window.location.href.split("?")[0]
    );
    // configuration -> authorization_grant
    protected readonly authorization_grant = signal("code");
    // configuration -> authorization (google specific)
    protected readonly access_type = signal("");
    protected readonly include_granted_scopes = signal("");
    protected readonly enable_granular_consent = signal("");
    // Configuration options
    protected readonly no_discovery = signal(false);
    protected readonly no_pkce = signal(false);
    protected readonly no_state = signal(false);
    protected readonly no_nonce = signal(false);
    // parameters.response_type
    protected readonly code = signal(false);
    protected readonly token = signal(false);
    protected readonly id_token = signal(false);
    protected readonly none = signal(false);
    protected readonly response_type = computed(() => [
        ...(this.code() ? ["code"] : []),
        ...(this.token() ? ["token"] : []),
        ...(this.id_token() ? ["id_token"] : []),
        ...(this.none() ? ["none"] : []),
    ]);
    protected readonly calculated_code = computed(() =>
        this.authorization_grant() == "code"
            ? true
            : this.authorization_grant() == "implicit"
            ? false
            : this.code()
    );
    protected readonly calculated_token = computed(() => this.token());
    protected readonly calculated_id_token = computed(() => this.id_token());
    protected readonly calculated_none = computed(() =>
        this.authorization_grant() == "code" ? false : this.none()
    );
    // parameters.scope
    protected readonly openid = signal(false);
    protected readonly email = signal(false);
    protected readonly profile = signal(false);
    protected readonly api_scope = signal(true);
    protected readonly api_scope_string = signal(
        "https://www.googleapis.com/auth/drive"
    );
    protected readonly scope = computed(() => [
        ...(this.openid() ? ["openid"] : []),
        ...(this.email() ? ["email"] : []),
        ...(this.profile() ? ["profile"] : []),
        ...(this.api_scope() ? [this.api_scope_string()] : []),
    ]);
    protected readonly calculated_openid = computed(
        () => this.openid() || this.scope().length == 0
    );
    protected readonly calculated_email = computed(() => this.email());
    protected readonly calculated_profile = computed(() => this.profile());
    protected readonly calculated_api_scope = computed(() => this.api_scope());
    //
    protected readonly config = signal(<IOAuth2Config>{});
    protected readonly textModified = signal(false);
    protected readonly response = signal<[string, any][]>([]);
    protected readonly discovery_response = signal<[string, any][]>([]);
    protected readonly token_response = signal<[string, any][]>([]);
    protected readonly idTokenVerification = signal<[string, any][]>([]);
    protected readonly hasResponses = computed(
        () =>
            !!this.response().length ||
            !!this.discovery_response().length ||
            !!this.token_response().length ||
            !!this.idTokenVerification().length
    );
    protected readonly hasRefreshToken = () =>
        !!this.oauth2.config?.parameters?.refresh_token;
    protected readonly hasAccessToken = () =>
        !!this.oauth2.config?.parameters?.access_token;
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
            const api = this.api();
            const exampleConfig = (
                api == "google-web-app"
                    ? JSON.parse(JSON.stringify(webAppConfig))
                    : JSON.parse(JSON.stringify(desktopConfig))
            ) as IOAuth2Config; // custom
            const secret = (
                api == "google-web-app"
                    ? JSON.parse(JSON.stringify(webAppConfigSecret))
                    : JSON.parse(JSON.stringify(desktopConfigSecret))
            ) as customParametersType; // custom
            const tokenConfig = exampleConfig.configuration?.token ?? {};
            exampleConfig.configuration!["token"] = {
                ...tokenConfig,
                ...secret,
            };
            const oldApi = config?.configuration?.tag;
            let reset = false;

            if (oldApi != api) {
                const client_id = exampleConfig.parameters!.client_id ?? "";
                const client_secret =
                    exampleConfig.configuration!.token?.["client_secret"] ?? "";
                const redirect_uri = window.location.href.split("?")[0];
                this.client_id.set(client_id);
                this.client_secret.set(client_secret as string);
                this.redirect_uri.set(redirect_uri);
                // Reset subsequent data
                reset = true;
            }

            let newCfg: IOAuth2Config = {
                configuration: {
                    tag: api,
                },
            };

            // CONFIGURATION -> AUTHORIZATION_GRANT
            reset = cfgGrant.bind(this)(reset, config, newCfg, exampleConfig);

            // CONFIGURATION -> OPTIONS
            reset = cfgOptions.bind(this)(reset, config, newCfg);

            // CONFIGURATION -> AUTHORIZATION (GOOGLE SPECIFIC)
            reset = cfgAuthGoogle.bind(this)(reset, config, newCfg);

            // PARAMETERS -> RESPONSE_TYPE
            reset = cfgResponse.bind(this)(reset, config, newCfg);

            // PARAMETERS -> SCOPE
            cfgScope.bind(this)(reset, config, newCfg);

            sessionStorage.setItem("cf", JSON.stringify(newCfg));
            this.config.set(newCfg);
            saveParameters.bind(this)();
        },
        { allowSignalWrites: true }
    );

    async ngOnInit() {
        getParameters.bind(this)();

        const params = await this.oauth2.interceptor();
        // The code is not saved in the sessionStorage, but in the
        //      internal configuration of the service. If the service
        //      is destroyed (for example, by redirecting the web page),
        //      you should save it somewhere.
        const code = params.code;
        const id_token = (params as IOAuth2Parameters & { id_token: string })
            .id_token;

        this.response.set(Object.entries(params));

        if (code) {
            this.accessToken().catch();
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

    protected google = async () => {
        if (this.working()) return;
        this._working.set(true);

        this.resetResponses();
        saveParameters.bind(this)();

        try {
            this.oauth2.setConfig(this.config());

            await this.oauth2.fetchDiscoveryDoc();
            await this.oauth2.authorization();
        } catch (err) {
            console.error(err);

            const isHttpError = err instanceof HttpErrorResponse;
            const error: [string, any][] = isHttpError
                ? [[err.error.error, err.error.error_description]]
                : [[(err as Error).cause, (err as Error).message]];
            if (error[0][0].includes("fetchDiscoveryDoc")) {
                // Discovery request error
                this.discovery_response.set(error);
            } else {
                // Authorization request error
                this.response.set(error);
            }
        } finally {
            this._working.set(false);
        }
    };

    protected accessToken = async () => {
        if (this.working()) return;
        this._working.set(true);

        try {
            const res = await this.oauth2.token({
                client_secret: this.client_secret(),
            });
            this.token_response.set(Object.entries(res ?? {}));

            // Some flows respond with an id_token

            if ((res as IOAuth2Parameters & { id_token: string })?.id_token) {
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

            if (this.token_response().length) {
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

    protected refreshToken = async () => {
        if (this.working()) return;
        this._working.set(true);

        this.resetResponses();

        try {
            const res = await this.oauth2.refresh({
                client_secret: this.client_secret(),
            });
            this.token_response.set(Object.entries(res ?? {}));
        } catch (err) {
            console.error(err);

            const isHttpError = err instanceof HttpErrorResponse;
            const error: [string, any][] = isHttpError
                ? [[err.error.error, err.error.error_description]]
                : [[(err as Error).cause, (err as Error).message]];

            // Token request error
            this.token_response.set(error);
        } finally {
            this._working.set(false);
        }
    };

    protected revokeToken = async () => {
        //this, this.endPoint(this.oauth2.revocation, this.token_response);

        if (this.working()) return;
        this._working.set(true);

        this.resetResponses();

        try {
            const res = await this.oauth2.revocation();
            this.token_response.set(Object.entries(res ?? {}));
        } catch (err) {
            console.error(err);

            const isHttpError = err instanceof HttpErrorResponse;
            const error: [string, any][] = isHttpError
                ? [[err.error.error, err.error.error_description]]
                : [[(err as Error).cause, (err as Error).message]];

            // Token request error
            this.token_response.set(error);
        } finally {
            this._working.set(false);
        }
    };

    // protected endPoint = async (
    //     endPoint: Function,
    //     response: WritableSignal<[string, any][]>
    // ) => {
    //     if (this.working()) return;
    //     this._working.set(true);

    //     this.resetResponses();

    //     try {
    //         const res = await endPoint();
    //         response.set(Object.entries(res ?? {}));
    //     } catch (err) {
    //         console.error(err);

    //         const isHttpError = err instanceof HttpErrorResponse;
    //         const error: [string, any][] = isHttpError
    //             ? [[err.error.error, err.error.error_description]]
    //             : [[(err as Error).cause, (err as Error).message]];

    //         // Token request error
    //         response.set(error);
    //     } finally {
    //         this._working.set(false);
    //     }
    // };

    protected resetResponses = () => {
        this.response.set([]);
        this.discovery_response.set([]);
        this.token_response.set([]);
        this.idTokenVerification.set([]);
    };
}


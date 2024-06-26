import { ChangeDetectionStrategy, Component, Pipe, PipeTransform, computed, effect, inject, signal, type OnInit } from "@angular/core";
import { Oauth2Service, IOAuth2Config, authorizationGrantType, IOAuth2Parameters } from "ngx-oauth2-oidc";
import webAppConfig  from "../../../public/google-web-app.config.json";
import desktopConfig from "../../../public/google-desktop.config.json";
import webAppConfigSecret from "../../../public/google-web-app.secret.json";
import desktopConfigSecret from "../../../public/google-desktop.secret.json";
import { FormsModule } from "@angular/forms"
import { SlicePipe, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { JOSEError } from "jose/errors";
import { customParametersType } from "../../../../ngx-oauth2-oidc/src/domain";

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
    protected readonly no_pkce = signal(false);
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
    // protected readonly minimumScope = computed(() => {
    //     let cnt = 0;
    //     cnt += this.openid() ? 1 : 0;
    //     cnt += this.email() ? 1 : 0;
    //     cnt += this.profile() ? 1 : 0;
    //     cnt += this.api_scope() ? 1 : 0;
    //     return cnt <= 1;
    // });
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
    // protected readonly response_type = computed(() => {
    //     const val = [];
    //     this.code() && val.push("code");
    //     this.token() && val.push("token");
    //     this.id_token() && val.push("id_token");
    //     return val.length ? val.join(" ") : "none";
    // });
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
            exampleConfig.configuration!["token"] = {...tokenConfig, ...secret};
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

            // CONFIGURATION -> AUTHORIZATION_GRANT

            let authorization_grant;

            if (reset) {
                authorization_grant = "code";
                this.authorization_grant.set(authorization_grant);
            } else {
                const old = config?.configuration?.authorization_grant;
                authorization_grant = this.authorization_grant();
                reset = reset || old != authorization_grant;
            }

            // BASIC CONFIGURATION OBJECT

            let newCfg;

            if (true) {
                const client_id = this.client_id();
                const authorization =
                    exampleConfig.configuration?.authorization ?? {};
                const token = exampleConfig.configuration?.token ?? {};
                delete token["client_secret"];
                const metadata = exampleConfig.metadata ?? {};
                const parameters = exampleConfig.parameters ?? {};
                delete parameters["client_id"];
                delete parameters["redirect_uri"];
                delete parameters["scope"];
                delete parameters["response_type"];
                newCfg = {
                    configuration: {
                        tag: api,
                        authorization_grant,
                        ...(Object.keys(authorization).length && {
                            authorization,
                        }),
                        ...(Object.keys(token).length && {
                            token,
                        }),
                    },
                    ...(Object.keys(metadata).length && {
                        metadata,
                    }),
                    parameters: {
                        ...parameters,
                        client_id,
                        redirect_uri: this.redirect_uri(),
                    },
                } as IOAuth2Config;
            }

            // CONFIGURATION -> AUTHORIZATION (GOOGLE SPECIFIC)

            let access_type, include_granted_scopes, enable_granular_consent;

            if (reset) {
                access_type =
                    include_granted_scopes =
                    enable_granular_consent =
                        "";
                this.access_type.set(access_type);
                this.include_granted_scopes.set(include_granted_scopes);
                this.enable_granular_consent.set(enable_granular_consent);
            } else {
                const oldAccess =
                    config?.configuration?.authorization?.["access_type"] ?? "";
                const oldInclude =
                    config?.configuration?.authorization?.[
                        "include_granted_scopes"
                    ] ?? "";
                const oldEnable =
                    config?.configuration?.authorization?.[
                        "enable_granular_consent"
                    ] ?? "";

                access_type = this.access_type();
                include_granted_scopes = this.include_granted_scopes();
                enable_granular_consent = this.enable_granular_consent();

                reset =
                    reset ||
                    oldAccess != access_type ||
                    oldInclude != include_granted_scopes ||
                    oldEnable != enable_granular_consent;
            }

            if (true) {
                const authorization = newCfg.configuration?.authorization ?? {};

                delete authorization["access_type"];
                delete authorization["include_granted_scopes"];
                delete authorization["enable_granular_consent"];

                newCfg.configuration!.authorization = {
                    ...authorization,
                    ...(access_type && { access_type }),
                    ...(include_granted_scopes !== "" && {
                        include_granted_scopes,
                    }),
                    ...(enable_granular_consent !== "" && {
                        enable_granular_consent,
                    }),
                };

                if (!Object.keys(newCfg.configuration!.authorization).length)
                    delete newCfg.configuration!.authorization;
            }

            // PARAMETERS -> RESPONSE_TYPE

            let code, token, id_token, none;

            if (reset) {
                code = token = id_token = none = false;
                this.code.set(code);
                this.token.set(token);
                this.id_token.set(id_token);
                this.none.set(none);
            } else {
                const response_type = config?.parameters?.response_type ?? [];

                const oldCode = response_type.includes("code");
                const oldToken = response_type.includes("token");
                const oldIdToken = response_type.includes("id_token");
                const oldNone = response_type.includes("none");

                code = this.code();
                token = this.token();
                id_token = this.id_token();
                none = this.none();

                reset =
                    reset ||
                    oldCode != code ||
                    oldToken != token ||
                    oldIdToken != id_token ||
                    oldNone != none;
            }

            if (true) {
                newCfg.parameters!.response_type = this.response_type();

                if (!newCfg.parameters!.response_type.length)
                    delete newCfg.parameters!.response_type;
            }

            // PARAMETERS -> SCOPE

            let openid, email, profile, api_scope;

            if (reset) {
                openid = email = profile = api_scope = false;
                this.openid.set(openid);
                this.email.set(email);
                this.profile.set(profile);
                this.api_scope.set(api_scope);
            } else {
                const scope = config?.parameters?.scope ?? [];

                const oldOpenid = scope.includes("openid");
                const oldEmail = scope.includes("email");
                const oldProfile = scope.includes("profile");
                const oldApiScope = scope.includes("none");

                openid = this.openid();
                email = this.email();
                profile = this.profile();
                api_scope = this.api_scope();

                reset =
                    reset ||
                    oldOpenid != openid ||
                    oldEmail != email ||
                    oldProfile != profile ||
                    oldApiScope != api_scope;
            }

            if (true) {
                newCfg.parameters!.scope = this.scope();

                if (!newCfg.parameters!.scope.length)
                    delete newCfg.parameters!.scope;
            }

            // newCfg.parameters!.client_id =
            //     client_id == "" ? newCfg.parameters!.client_id : client_id;
            sessionStorage.setItem("cf", JSON.stringify(newCfg));
            this.config.set(newCfg);
            this.saveParameters();
            console.log("EFFECTTTTTTTTTTT", this.code(), this.none());
            /* const oldApi = config?.configuration?.tag;
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
            //console.log("RESTYP", rt); */
        },
        { allowSignalWrites: true }
    );

    async ngOnInit() {
        this.getParameters();
        console.log("RRDD", this.redirect_uri);

        const params = await this.oauth2.interceptor();
        // The code is not saved in the sessionStorage, but in the
        //      internal configuration of the service. If the service
        //      is destroyed (for example, by redirecting the web page),
        //      you should save it somewhere.
        const code = params.code;
        const id_token = (params as IOAuth2Parameters & { id_token: string })
            .id_token;

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

    private saveParameters = (): void => {
        const api = this.api();
        const client_id = this.client_id();
        const client_secret = this.client_secret();
        const authorization_grant = this.authorization_grant();
        const access_type = this.access_type();
        const include_granted_scopes = this.include_granted_scopes();
        const enable_granular_consent = this.enable_granular_consent();
        const code = this.code();
        const token = this.token();
        const id_token = this.id_token();
        const none = this.none();
        const openid = this.openid();
        const email = this.email();
        const profile = this.profile();
        const api_scope = this.api_scope();
        const no_pkce = this.no_pkce();
        const textModified = this.textModified();

        sessionStorage.setItem(
            "pr",
            JSON.stringify({
                api,
                client_id,
                client_secret,
                authorization_grant,
                access_type,
                include_granted_scopes,
                enable_granular_consent,
                code,
                token,
                id_token,
                none,
                openid,
                email,
                profile,
                api_scope,
                no_pkce,
                textModified,
            })
        );
    };

    private getParameters = () => {
        const strObject = sessionStorage.getItem("pr");
        if (strObject) {
            const object = JSON.parse(strObject);
            this.api.set(object.api);
            this.client_id.set(object.client_id);
            this.client_secret.set(object.client_secret);
            this.authorization_grant.set(object.authorization_grant);
            this.access_type.set(object.access_type);
            this.include_granted_scopes.set(object.include_granted_scopes);
            this.enable_granular_consent.set(object.enable_granular_consent);
            this.code.set(object.code);
            this.token.set(object.token);
            this.id_token.set(object.id_token);
            this.none.set(object.none);
            this.openid.set(object.openid);
            this.email.set(object.email);
            this.profile.set(object.profile);
            this.api_scope.set(object.api_scope);
            this.no_pkce.set(object.no_pkce);
            this.textModified.set(object.textModified);
        }
    };

    protected google = async () => {
        if (this.working()) return;
        this._working.set(true);

        this.resetResponses();
        this.saveParameters();

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

    protected resetResponses = () => {
        this.response.set([]);
        this.discovery_response.set([]);
        this.token_response.set([]);
        this.idTokenVerification.set([]);
    };
}


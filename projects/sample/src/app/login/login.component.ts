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
import { cfgAuthorization } from "./_cfgAuthorization";
import { cfgConfiguration } from "./_cfgConfiguration";
import { saveParameters } from "./_saveParameters";
import { getParameters } from "./_getParameters";
import { cfgRedirectUri } from "./_cfgRedirectUri";
import { cfgClient } from "./_cfgClient";
import { cfgMetadata } from "./_cfgMetadata";
import { cfgExample } from "./_cfgExample";
import { CollapsibleComponent } from "../collapsible/collapsible.component";
import { MatDialog } from "@angular/material/dialog";
import { ModalComponent } from "../modal/modal.component";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

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

const text = {
    GOOGLE_WEB_APP: `
        <b>&#x2022;</b> Google credentials must be of type 'Web application'<br>
        <b>&#x2022;</b> The 'issuer' (metadata section) is "https://accounts.google.com"<br>
        <b>&#x2022;</b> 'authorization' endpoint uses custom parameters`,
};

@Component({
    standalone: true,
    templateUrl: "login.component.html",
    imports: [
        FormsModule,
        SlicePipe,
        Json4Pipe,
        NgIf,
        CollapsibleComponent,
        MatIcon,
        MatButtonModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "container-fluid row mt-3" },
    styles: [
        "fieldset {background-color: lightsalmon}", // PARAMETERS
        "fieldset.credentials {background-color: darkseagreen}",
        "fieldset.authorization {background-color: burlywood}",
        "fieldset.metadata {background-color: burlywood}",
        "legend {background-color: indianred; color: white}", // PARAMETERS
        "legend.credentials {background-color: green; color: white}", // PARAMETERS
        "legend.authorization {background-color: peru; color: white}", // PARAMETERS
        "legend.metadata {background-color: peru; color: white}", // PARAMETERS
        "legend .credentials {background-color: green; color: white}",
        ".text-break {line-break: anywhere}",
    ],
})
export class LoginComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    private readonly oauth2 = inject(Oauth2Service);
    private _working = signal(false);
    private count = 0;
    protected readonly working = this._working.asReadonly();
    // authorization server credentials
    protected readonly api = signal("google-web-app");
    // configuration
    protected readonly authorization_grant = signal<"code" | "implicit">(
        "code"
    );
    //protected readonly no_discovery = signal(false);
    protected readonly no_pkce = signal(false);
    protected readonly no_state = signal(false);
    protected readonly no_nonce = signal(false);
    protected readonly test = signal(true);
    // authorization -> credentials-dependent
    protected readonly access_type = signal("");
    protected readonly include_granted_scopes = signal("");
    protected readonly enable_granular_consent = signal("");
    // metadata -> credentials-dependent
    protected readonly issuer = signal("");
    // parameters -> credentials-dependent
    protected readonly client_id = signal("");
    protected readonly client_secret = signal("");
    // parameters.redirect_uri
    protected readonly redirect_uri = signal(
        window.location.href.split("?")[0]
    );
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
    protected readonly calculated_no_pkce = computed(() => this.no_pkce());
    protected readonly calculated_no_state = computed(() => this.no_state());
    protected readonly calculated_no_nonce = computed(() => this.no_nonce());
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
        this.authorization_grant() == "code" ||
        this.code() ||
        this.token() ||
        this.id_token()
            ? false
            : this.none()
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
    // REQUESTS
    protected readonly discovery_request = signal<[string, any][]>([]);
    protected readonly authorization_request = signal<[string, any][]>([]);
    protected readonly token_request = signal<[string, any][]>([]);
    protected readonly verification_request = signal<[string, any][]>([]);
    protected readonly revocation_request = signal<[string, any][]>([]);
    // RESPONSES
    protected readonly configuration_response = signal<[string, any][]>([]);
    protected readonly discovery_response = signal<[string, any][]>([]);
    protected readonly authorization_response = signal<[string, any][]>([]);
    protected readonly token_response = signal<[string, any][]>([]);
    protected readonly verification_response = signal<[string, any][]>([]);
    protected readonly revocation_response = signal<[string, any][]>([]);
    // OPENED DATA
    protected readonly configuration_open = signal(false);
    protected readonly discovery_open = signal(false);
    protected readonly authorization_open = signal(false);
    protected readonly token_open = signal(false);
    protected readonly verification_open = signal(false);
    protected readonly revocation_open = signal(false);
    // ERRORS
    protected readonly configuration_error = signal(false);
    protected readonly discovery_error = signal(false);
    protected readonly authorization_error = signal(false);
    protected readonly token_error = signal(false);
    protected readonly verification_error = signal(false);
    protected readonly revocation_error = signal(false);
    //
    protected readonly hasResponses = computed(
        () =>
            !!Object.entries(this.configuration_response()).length ||
            !!this.discovery_response().length ||
            !!this.authorization_response().length ||
            !!this.token_response().length ||
            !!this.verification_response().length ||
            !!this.revocation_response().length ||
            !!this.discovery_request().length ||
            !!this.authorization_request().length ||
            !!this.token_request().length ||
            !!this.verification_request().length ||
            !!this.revocation_request().length
    );
    protected readonly hasRefreshToken = () =>
        !!this.oauth2.config?.parameters?.refresh_token;
    protected readonly hasAccessToken = () =>
        !!this.oauth2.config?.parameters?.access_token;
    protected readonly hasCode = () => !!this.oauth2.config?.parameters?.code;
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
            const oldApi = config?.configuration?.tag;
            const exampleConfig = (
                api == "google-web-app"
                    ? JSON.parse(JSON.stringify(webAppConfig))
                    : JSON.parse(JSON.stringify(desktopConfig))
            ) as IOAuth2Config; // custom
            const credentials = (
                api == "google-web-app"
                    ? JSON.parse(JSON.stringify(webAppConfigSecret))
                    : JSON.parse(JSON.stringify(desktopConfigSecret))
            ) as customParametersType; // custom
            let reset = oldApi != api;

            let newCfg: IOAuth2Config = {
                configuration: {
                    tag: api,
                },
            };

            cfgExample(newCfg, exampleConfig);

            // CONFIGURATION
            reset = cfgConfiguration.bind(this)(reset, config, newCfg);

            // CONFIGURATION -> AUTHORIZATION (GOOGLE SPECIFIC)
            reset = cfgAuthorization.bind(this)(reset, config, newCfg);

            // METADATA -> CREDENTIALS-DEPENDENT
            reset = cfgMetadata.bind(this)(
                reset,
                config,
                newCfg,
                exampleConfig
            );

            // PARAMETERS -> CREDENTIALS-DEPENDENT
            reset = cfgClient.bind(this)(reset, config, newCfg, credentials);

            // PARAMETERS -> REDIRECT_URI
            reset = cfgRedirectUri.bind(this)(reset, config, newCfg);

            // PARAMETERS -> RESPONSE_TYPE
            reset = cfgResponse.bind(this)(reset, config, newCfg);

            // PARAMETERS -> SCOPE
            cfgScope.bind(this)(reset, config, newCfg);

            sessionStorage.setItem("cf", JSON.stringify(newCfg));
            delete newCfg.parameters?.client_secret;
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
        let id_token = params.id_token;
        // const id_token = (params as IOAuth2Parameters & { id_token: string })
        //     .id_token;

        const entries = Object.entries(params);
        console.log("PARAMS", params);
        if (entries.length) {
            this.authorization_response.set(entries);
        }

        // if (code) {
        //     // this.accessToken();
        //     const res = await this.endPoint(
        //         this.oauth2.token,
        //         this.token_response,
        //         this.token_error,
        //         this.token_open,
        //         {
        //             client_secret: this.client_secret(),
        //         },
        //         false
        //     );
        //     if (!!id_token && !!res?.id_token) {
        //         console.error(
        //             `WARNING: Two "id_token" parameters received: ${id_token} & ${res?.id_token}`
        //         );
        //     }
        //     id_token ??= res?.id_token;ng testbed privider

        // Some flows respond to the redirect with an id_token
        if (id_token) {
            const res = await this.endPoint(
                this.oauth2.verify_token,
                this.verification_request,
                this.verification_response,
                this.verification_error,
                this.verification_open,
                false
            );
            console.log("VERIRES", res);

            // try {
            //     const resp = await this.oauth2.verify_token();
            //     this.verification_response.set(Object.entries(resp));
            // } catch (err) {
            //     console.log(
            //         "ID_TOKEN ERR",
            //         (err as Error).name,
            //         (err as Error).message
            //     );
            //     this.verification_response.set([
            //         [(err as Error).name, (err as Error).message],
            //     ]);
            // }
        }
        // Remove query and fragment strings
        window.history.replaceState({}, "", window.location.pathname);
    }

    // protected setConfig = (s: string) => {
    //     try {
    //         const obj = JSON.parse(s);
    //         this.configError.set("");
    //         console.log("SETCONFIG", obj);
    //         sessionStorage.setItem("cf", JSON.stringify(obj));
    //         this.config.set(obj);
    //         this.textModified.set(true);
    //     } catch (err) {
    //         if (err instanceof SyntaxError) this.configError.set(err.message);
    //         console.log("SETCONFIG ERR", err);
    //     }
    // };

    protected login = async () => {
        let resCfg;

        try {
            this.resetResponses();
            resCfg = await this.oauth2.setConfig(this.config());
            this.configuration_error.set(false);
        } catch (err) {
            this.configuration_error.set(true);
            this.configuration_open.set(true);
            this.configuration_response.set(this.endPointError(err));
        } finally {
            saveParameters.bind(this)();
        }

        if (!resCfg) return;

        const resDisc = await this.endPoint(
            this.oauth2.fetchDiscoveryDoc,
            this.discovery_request,
            this.discovery_response,
            this.discovery_error,
            this.discovery_open,
            false
        );
        console.log("RD", resDisc);
        if (!resDisc) return;

        const resAuth = await this.endPoint(
            this.oauth2.authorization,
            this.authorization_request,
            this.authorization_response,
            this.authorization_error,
            this.authorization_open,
            false
        );
        console.log("RA", resAuth);
        debugger;
        if (resAuth) this.authorization_request.set(Object.entries(resAuth));
    };

    // protected accessToken = async () => {
    //     const res = await this.endPoint(
    //         this.oauth2.token,
    //         this.token_response,
    //         this.token_error,
    //         this.token_open,
    //         {
    //             client_secret: this.client_secret(),
    //         },
    //         false
    //     );
    //     if ((res as IOAuth2Parameters & { id_token: string })?.id_token) {
    //         await this.endPoint(
    //             this.oauth2.verify_token,
    //             this.verification_response,
    //             this.verification_error,
    //             this.verification_open,
    //             false
    //         );
    //     }
    // };

    protected accessToken = async () => {
        const id_token = this.oauth2.config?.parameters?.id_token;
        const res = await this.endPoint(
            this.oauth2.token,
            this.token_request,
            this.token_response,
            this.token_error,
            this.token_open,
            {
                client_secret: this.client_secret(),
            }
        );
        console.log("ACCESSTOKENEQ", res, id_token == res?.id_token);
        if (res?.id_token) {
            await this.endPoint(
                this.oauth2.verify_token,
                this.verification_request,
                this.verification_response,
                this.verification_error,
                this.verification_open,
                {
                    id_token: res.id_token,
                },
                false
            );
        }
    };

    protected refreshToken = async () => {
        const id_token = this.oauth2.config?.parameters?.id_token;
        const res = await this.endPoint(
            this.oauth2.refresh,
            this.token_request,
            this.token_response,
            this.token_error,
            this.token_open,
            {
                client_secret: this.client_secret(),
            }
        );
        console.log("REFRESHTOKENEQ", res?.id_token, id_token == res?.id_token);
        if (res?.id_token) {
            await this.endPoint(
                this.oauth2.verify_token,
                this.verification_request,
                this.verification_response,
                this.verification_error,
                this.verification_open,
                {
                    id_token: res.id_token,
                },
                false
            );
        }
    };

    protected revokeToken = async () => {
        this.endPoint(
            this.oauth2.revocation,
            this.revocation_request,
            this.revocation_response,
            this.revocation_error,
            this.revocation_open
        );
    };

    private endPoint = async (
        endPoint: Function,
        request: WritableSignal<[string, any][]>,
        response: WritableSignal<[string, any][]>,
        error: WritableSignal<boolean>,
        open: WritableSignal<boolean>,
        options?: customParametersType | boolean,
        reset?: boolean
    ): Promise<IOAuth2Parameters | undefined> => {
        if (typeof options == "boolean" && typeof reset == "boolean")
            throw "'options' must be of type object";

        if (this.working()) return;
        this._working.set(true);

        if (typeof options == "boolean") {
            reset = options;
            options = undefined;
        }
        reset ??= true;

        if (reset) this.resetResponses();

        try {
            const httpRes = await endPoint(options);
            const req = Object.entries(httpRes?.[0] ?? {});
            const res = Object.entries(httpRes?.[1] ?? {});
            request.set(req);
            response.set(res);
            error.set(false);
            console.log("RES", req, res, httpRes);
            return httpRes;
        } catch (err) {
            // Endpoint request error
            console.log(err);
            response.set(this.endPointError(err));
            error.set(true);
            open.set(true);
            console.log("RES CATCH", err);
            return Promise.resolve(undefined);
        } finally {
            saveParameters.bind(this)();
            this._working.set(false);
        }
    };

    private endPointError = (err: unknown) => {
        const isJOSEError = err instanceof JOSEError;
        const isHttpError = err instanceof HttpErrorResponse;
        const isOAuth2Error = isHttpError && !!err.error.error;

        const error: [string, any][] = isOAuth2Error
            ? [[err.error.error, err.error.error_description]]
            : isHttpError
            ? [
                  [
                      (err as HttpErrorResponse).statusText,
                      (err as HttpErrorResponse).message,
                  ],
              ]
            : isJOSEError
            ? [[(err as JOSEError).name, (err as JOSEError).message]]
            : [[(err as Error).cause, (err as Error).message]];
        return error;
    };

    protected resetResponses = () => {
        // REQUESTS
        this.discovery_request.set([]);
        this.authorization_request.set([]);
        this.token_request.set([]);
        this.verification_request.set([]);
        this.revocation_request.set([]);
        // RESPONSES
        this.configuration_response.set([]);
        this.discovery_response.set([]);
        this.authorization_response.set([]);
        this.token_response.set([]);
        this.verification_response.set([]);
        this.revocation_response.set([]);
        // OPENED DATA
        this.configuration_open.set(false);
        this.discovery_open.set(false);
        this.authorization_open.set(false);
        this.token_open.set(false);
        this.verification_open.set(false);
        this.revocation_open.set(false);
        // ERRORS
        this.configuration_error.set(false);
        this.discovery_error.set(false);
        this.authorization_error.set(false);
        this.token_error.set(false);
        this.verification_error.set(false);
        this.revocation_error.set(false);
    };

    openDialog(
        enterAnimationDuration: string,
        exitAnimationDuration: string
    ): void {
        this.dialog.open(ModalComponent, {
            width: "22rem",
            enterAnimationDuration,
            exitAnimationDuration,
            data: { text: text.GOOGLE_WEB_APP },
        });
    }
}


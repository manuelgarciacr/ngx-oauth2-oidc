import { setStore } from "./_store";
import {
    HttpClient,
} from "@angular/common/http";
import {
    Inject,
    Injectable,
    InjectionToken,
    inject
} from "@angular/core";
import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
    jsonObject,
    methodType,
    payloadType,
} from "../domain";
import { _oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { _interceptor } from "./_interceptor";
import { _verify_token } from "./_verify_token";
import { _discovery } from "./_discovery";
import { _authorization } from "./_authorization";
import { _token } from "./_token";
import { _revocation } from "./_revocation";
import { _errorArray } from "./_errorArray";
import { _setParameters } from "./_setParameters";
import { _api_request } from "./_apiReguest";
import { _save_state } from "./_saveState";
import { _recover_state } from "./_recoverState";

export const OAUTH2_CONFIG_TOKEN = new InjectionToken<IOAuth2Config>(
    "OAuth2 Config"
);

// TODO: introspection endpoint
// TODO: add path to the issuer (multiple issuers)

@Injectable({
    providedIn: "root",
})
export class Oauth2Service {
    private readonly http = inject(HttpClient);

    private _config: IOAuth2Config = {};
    private _idToken: jsonObject = {}; // Api user id_token claims
    private _isIdTokenIntercepted = false;
    private _isAccessTokenIntercepted = false;
    private _isCodeIntercepted = false;

    get config() {
        return this._config;
    }
    get idToken() {
        return this._idToken;
    }

    // FLAGS
    get isIdTokenIntercepted() {
        return this._isIdTokenIntercepted;
    }
    get isAccessTokenIntercepted() {
        return this._isAccessTokenIntercepted;
    }
    get isCodeIntercepted() {
        return this._isCodeIntercepted;
    }

    constructor(
        @Inject(OAUTH2_CONFIG_TOKEN) protected oauth2Config?: IOAuth2Config
    ) {
        const newConfig = oauth2Config ?? {};
        const config = _oauth2ConfigFactory(newConfig);
        const storage = config.configuration?.storage;

        this._config = config;

        setStore("config", storage ? config : null);
        setStore("idToken");
        setStore("test");
    }

    setConfig = (oauth2Config: IOAuth2Config) => {
        const config = _oauth2ConfigFactory(oauth2Config);
        const storage = config.configuration?.storage;

        this._config = config;
        this._idToken = {};

        if (!storage) return;

        setStore("config", storage ? config : null);
        setStore("idToken");
        setStore("test");

        return this.config;
    };

    setParameters = (parameters: IOAuth2Parameters) => {
        const parms = { ...parameters };
        const configParms = { ...this.config.parameters };
        const storage = this.config.configuration?.storage;

        for (const parm in parameters) {
            const key = parm as keyof IOAuth2Parameters;
            const value = parameters[key] as any;

            if (value === undefined || value === null) {
                delete configParms[key];
            }
        }

        parameters = _setParameters(
            parms as customParametersType,
            "setParameters"
        );

        this._config.parameters = { ...configParms, ...parameters };

        setStore("config", storage ? this.config : null);
    };

    /**
     * Each endpoint uses the parameters defined within the 'parameters' section (config.parameters)
     *      that are applicable to it. Custom endpoint parameters (config.endpoint_name} can
     *      override standard parameters. Inline custom parameters (o auth2Service.endpoint(customParameters, ...) )
     *      can override the configured parameters (standard or custom). An inline parameter with a
     *      null value removes the configured parameter ( oauth2Service.endpoint({parm: null}, ...) ).
     *
     * @param customParameters
     * @param url
     * @returns
     */
    discovery = (customParameters = <customParametersType>{}, url?: string) => {
        return _discovery(
            this.http,
            this._config, // Parameter passed by reference and updated (config.metadata)
            customParameters,
            url
        );
    };

    /**
     * Each endpoint uses the parameters defined within the 'parameters' section (config.parameters)
     *      that are applicable to it. Custom endpoint parameters (config.endpoint_name} can
     *      override standard parameters. Inline custom parameters (o auth2Service.endpoint(customParameters, ...) )
     *      can override the configured parameters (standard or custom). An inline parameter with a
     *      null value removes the configured parameter ( oauth2Service.endpoint({parm: null}, ...) ).
     *
     * {@link https://github.com/manuelgarciacr/ngx-oauth2-oidc/blob/main/docs/getting_started.md#rocket-getting-started | ngx-oauth2-oidc documentation}
     *
     * @param customParameters {@link customParametersType} BLAAAA B
     * @param {string} url
     * @returns
     */
    authorization = async (
        customParameters = <customParametersType>{},
        statePayload?: string,
        url?: string
    ) => {
        return _authorization(
            this.http,
            this._config, // Parameter passed by reference and updated (config.parameters)
            customParameters,
            statePayload,
            url
        );
    };

    token = async (
        customParameters = <customParametersType>{},
        url?: string
    ) => {
        return _token(
            this.http,
            this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "authorization_code",
                ...customParameters,
            },
            url
        );
    };

    apiRequest = async (
        customParameters = <customParametersType>{},
        url?: string,
        method: methodType = "GET",
        headers: jsonObject = {},
        body: payloadType = {}
    ) => {
        return _api_request(
            this.http,
            this.config,
            customParameters,
            url,
            method,
            headers,
            body
        );
    };

    refresh = async (
        customParameters = <customParametersType>{},
        url?: string
    ) => {
        return _token(
            this.http,
            this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "refresh_token",
                redirect_uri: null,
                ...customParameters,
            },
            url
        );
    };

    revocation = async (
        customParameters = <customParametersType>{},
        url?: string
    ) => {
        return _revocation(
            this.http,
            this._config, // Parameter passed by reference and could be updated (config.parameters)
            customParameters,
            url
        );
    };

    verifyToken = async (
        customParameters = <customParametersType>{},
        issuer?: string,
        jwks_uri?: string
    ) => {
        const storage = this.config.configuration?.storage;

        this._idToken = {};

        setStore("idToken");

        await _verify_token(
            this.config,
            customParameters,
            issuer,
            jwks_uri
        ).then(idToken => {
            this._idToken = (idToken as jsonObject) ?? {};
            setStore("idToken", storage ? this.idToken : null);
        });
    };

    interceptor = async () => {
        const int = _interceptor(
            this._config, // Parameter passed by reference and updated (oauth2Service.config.parameters)
            this._idToken // Parameter passed by reference and updated (oauth2Service.idToken)
        );

        await int.then(v => {
            this._isIdTokenIntercepted = !!v.id_token;
            this._isAccessTokenIntercepted = !!v.access_token;
            this._isCodeIntercepted = !!v.code;
        });

        return int;
    };

    saveState = async () => await _save_state(this._config, this._idToken);

    recoverState = async () => {
        await _recover_state(this._config, this._idToken);
    };

    errorArray = (err: unknown) => {
        return _errorArray(err);
    };
}

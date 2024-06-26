import { getStoreObject, setStore } from "./_store";
import { debugFn, toLowerCaseProperties } from "../utils";
import {
    HttpClient,
} from "@angular/common/http";
import {
    Inject,
    Injectable,
    InjectionToken,
    computed,
    inject,
} from "@angular/core";
import { Router } from "@angular/router";
import {
    IOAuth2Config,
    IOAuth2Metadata,
    customParametersType,
    IJwk,
} from "../domain";
import { oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { _interceptor } from "./_interceptor";
import { _verify_token } from "./_verify_token";
import { _fetchDiscoveryDoc } from "./_fetchDiscoveryDoc";
import { _authorization } from "./_authorization";
import { _token } from "./_token";
import { _revocation } from "./_revocation";

export const OAUTH2_CONFIG_TOKEN = new InjectionToken<IOAuth2Config>(
    "OAuth2 Config"
);

@Injectable({
    providedIn: "root",
})
export class Oauth2Service {
    static debug = 0; // debugEnum.mth | debugEnum.prv;
    private readonly http = inject(HttpClient);

    private _config: IOAuth2Config | null = null;
    private _discoveryDoc: IOAuth2Metadata | null = null;
    private _jwks: IJwk[] | null = null;
    private _userProfile: object | null = null; // Api user profile

    get config() {
        return this._config;
    }
    get discoveryDoc() {
        return this._discoveryDoc;
    }
    get jwks() {
        return this._jwks;
    }
    get userProfile() {
        return this._userProfile;
    }

    readonly isAuthenticated = computed(() => this.userProfile != null);

    constructor(
        private router: Router,
        @Inject(OAUTH2_CONFIG_TOKEN) protected oauth2Config?: IOAuth2Config
    ) {
        debugFn("mth", "CONSTRUCTOR", oauth2Config);

        const config = getStoreObject("config");

        if (!config && oauth2Config) {
            this._config = oauth2Config;
            debugFn("int", "CONSTRUCTOR CONFIGURATION");
        }

        if (config) this._config = config as IOAuth2Config;

        const discoveryDoc = getStoreObject("discoveryDoc");
        const jwks = getStoreObject("jwks");
        const userProfile = getStoreObject("userProfile");

        this._discoveryDoc = discoveryDoc;
        this._jwks = jwks as IJwk[] | null;
        this._userProfile = userProfile;
    }

    setConfig = (oauth2Config: IOAuth2Config) => {
        debugFn("mth", "SET_CONFIG", { ...oauth2Config });

        const config = oauth2ConfigFactory(oauth2Config);

        debugFn("int", "SET_CONFIG INTERNAL", JSON.stringify(config, null, 4));

        this._config = config;
        setStore("initialConfig", oauth2Config);
        setStore("config", config);
        setStore("discoveryDoc");
        setStore("jwks");
        setStore("userProfile");
        setStore("profile");

        return this.config;
    };

    fetchDiscoveryDoc = async () => {
        debugFn("mth", "FETCH_DISCOVERY_DOC");

        return _fetchDiscoveryDoc(this._config, this.http, this._discoveryDoc);
    };

    authorization = async (options = <customParametersType>{}) => {
        debugFn("mth", "AUTHORIZATION");

        return _authorization(
            this.http,
            this.config,
            toLowerCaseProperties(options)
        );
    };

    token = async (options = <customParametersType>{}) => {
        debugFn("mth", "TOKEN");

        return _token(this.http, this.config, {
            grant_type: "authorization_code",
            ...toLowerCaseProperties(options),
        })
    };

    refresh = async (options = <customParametersType>{}) => {
        debugFn("mth", "REFRESH");

        return _token(this.http, this.config, {
            grant_type: "refresh_token",
            ...toLowerCaseProperties(options),
        })
    };

    revocation = async (options = <customParametersType>{}) => {
        debugFn("mth", "REVOCATION");

        return _revocation(this.http, this.config, toLowerCaseProperties(options));
    };

    verify_token = async (options = <customParametersType>{}) => {
        debugFn("mth", "VERIFY_TOKEN");

        return _verify_token(
            this.config,
            this.userProfile,
            toLowerCaseProperties(options)
        );
    };

    // verify_token = async (
    //     this.config,
    //     toLowerCaseProperties(options)
    // ) => {
    //     debugFn("mth", "TOKEN_ID_VERIFY");

    //     const cfg = this.config?.configuration?.id_token_verify;
    //     const metadata = this.config?.metadata;
    //     const parms = this.config?.parameters;

    //     let jwks_uri = (options["jwks_uri"] ??
    //         cfg?.["jwks_uri"] ??
    //         metadata?.jwks_uri) as string | undefined;

    //     jwks_uri = notStrNull(jwks_uri, "");

    //     let id_token = (token ?? cfg?.["id_token"] ?? parms?.id_token) as
    //         | string
    //         | undefined;

    //     id_token = notStrNull(id_token, "");

    //     options = {
    //         ...this.config?.configuration?.id_token_verify,
    //         ...options,
    //     };

    //     return _verify_token(
    //         this._userProfile,
    //         jwks_uri,
    //         token,
    //         toLowerCaseProperties(options)
    //     );
    // };

    interceptor = async () => {
        debugFn("mth", "TOKEN_ID_VERIFY");

        return _interceptor(this.config);
    };
}


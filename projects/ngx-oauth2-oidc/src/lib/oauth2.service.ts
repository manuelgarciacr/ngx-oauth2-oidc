import { getStoreObject, setStore } from "./_store";
import { debugEnum, debugFn, toLowerCaseProperties } from "../utils";
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
import {
    IOAuth2Config,
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
    static debug = debugEnum.none;
    private readonly http = inject(HttpClient);

    private _config: IOAuth2Config = {};
    private _jwks: IJwk[] | null = null;
    private _userProfile: object | null = null; // Api user profile

    get config() {
        return this._config;
    }
    get jwks() {
        return this._jwks;
    }
    get userProfile() {
        return this._userProfile;
    }

    readonly isAuthenticated = computed(() => this.userProfile != null);

    constructor(
        @Inject(OAUTH2_CONFIG_TOKEN) protected oauth2Config?: IOAuth2Config
    ) {
        debugFn("mth", "CONSTRUCTOR", oauth2Config);

        let config = getStoreObject("config");

        if (config) {
            debugFn("int", "STORED CONFIGURATION", config);
        }

        config = oauth2Config ?? config;

        if (oauth2Config) {
            debugFn("int", "CONSTRUCTOR CONFIGURATION", config);
        }

        this.setConfig(config ?? {});

        const jwks = getStoreObject("jwks");
        const userProfile = getStoreObject("userProfile");

        this._jwks = jwks as IJwk[] | null;
        this._userProfile = userProfile;
    }

    setConfig = (oauth2Config: IOAuth2Config) => {
        debugFn("mth", "SET_CONFIG", { ...oauth2Config });

        const config = oauth2ConfigFactory(oauth2Config);

        debugFn(
            "int",
            "SET_CONFIG INTERNAL",
            JSON.stringify(oauth2Config, null, 4),
            JSON.stringify(config, null, 4)
        );

        this._config = config;

        setStore("initialConfig", oauth2Config);
        setStore("config", config);
        setStore("discoveryDoc");
        setStore("jwks");
        setStore("userProfile");
        setStore("profile");

        return this.config;
    };

    // fetchDiscoveryDoc = async (options = <customParametersType>{}) => {
    fetchDiscoveryDoc = async () => {
        debugFn("mth", "FETCH_DISCOVERY_DOC");

        return _fetchDiscoveryDoc(
            this.http,
            this._config, // Parameter passed by reference updated (config.metadata)
            // toLowerCaseProperties(options)
        );
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
        });
    };

    refresh = async (options = <customParametersType>{}) => {
        debugFn("mth", "REFRESH");

        return _token(this.http, this.config, {
            grant_type: "refresh_token",
            ...toLowerCaseProperties(options),
        });
    };

    revocation = async (options = <customParametersType>{}) => {
        debugFn("mth", "REVOCATION");

        return _revocation(
            this.http,
            this.config,
            toLowerCaseProperties(options)
        );
    };

    verify_token = async (options = <customParametersType>{}) => {
        debugFn("mth", "VERIFY_TOKEN");

        return _verify_token(
            this.config,
            this.userProfile,
            toLowerCaseProperties(options)
        );
    };

    interceptor = async () => {
        debugFn("mth", "TOKEN_ID_VERIFY");

        return _interceptor(this.config);
    };
}


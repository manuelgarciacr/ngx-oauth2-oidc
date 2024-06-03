import { getStore, getStoreObject, setStore } from "./_store";
import { debugEnum, debugFn } from "../utils";
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
    IOAuth2Parameters,
    customParameters,
    IJwk,
} from "../domain";
import { oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { request } from "./_request";
import { _interceptor } from "./_interceptor";
import { _id_token_verify } from "./_id_token_verify";
import { _fetchDiscoveryDoc } from "./_fetchDiscoveryDoc";

export const OAUTH2_CONFIG_TOKEN = new InjectionToken<IOAuth2Config>(
    "OAuth2 Config"
);

@Injectable({
    providedIn: "root",
})
export class Oauth2Service {
    static debug = debugEnum.mth | debugEnum.prv;
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
        this._userProfile = userProfile
    }

    setConfig = (oauth2Config: IOAuth2Config) => {
        debugFn("mth", "SET_CONFIG", { ...oauth2Config });

        const config = oauth2ConfigFactory(oauth2Config);

        debugFn("int", "SET_CONFIG INTERNAL", JSON.stringify(config, null, 4));

        this._config = config;
        setStore("config", config);
        setStore("discoveryDoc");
        setStore("jwks");
        setStore("userProfile");
        setStore("profile");

        return this.config
    }

    fetchDiscoveryDoc = async () => {
        debugFn("mth", "FETCH_DISCOVERY_DOC");

        return _fetchDiscoveryDoc(this._config, this.http, this._discoveryDoc)
    }

    authorization = async () => {
        debugFn("mth", "AUTHORIZATION");

        return request("authorization", "GET", "href", this._config, this.http)
    }

    token = async (code: string, client_secret?: string) => {
        debugFn("mth", "TOKEN", code);

        const customParms = client_secret ? { code, client_secret } : { code, client_secret: null };
        return request<IOAuth2Parameters>(
            "token",
            "POST",
            "http",
            this._config,
            this.http,
            customParms
        )
    }

    refresh = async (client_secret?: string) => {
        debugFn("mth", "REFRESH");

        const customParms = client_secret ? { client_secret } : { client_secret: null };
        return request<IOAuth2Parameters>(
            "refresh",
            "POST",
            "http",
            this._config,
            this.http,
            customParms
        )
    }

    revocation = async () => {
        debugFn("mth", "REVOCATION");

        return request<IOAuth2Parameters>(
            "revocation",
            "POST",
            "http",
            this._config,
            this.http
        )
    }

    id_token_verify = async (token?: string, options?: customParameters) => {
        debugFn("mth", "TOKEN_ID_VERIFY");
        return _id_token_verify(this._config, this._userProfile, token, options)
    }

    interceptor = async () => {
        debugFn("mth", "TOKEN_ID_VERIFY");
        return _interceptor(this._config)
    }
}

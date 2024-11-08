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
    IOAuth2Parameters,
    customParametersType,
    payloadType,
} from "../domain";
import { _oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { _interceptor } from "./_interceptor";
import { _verify_token } from "./_verify_token";
import { _fetchDiscoveryDoc } from "./_fetchDiscoveryDoc";
import { _authorization } from "./_authorization";
import { _token } from "./_token";
import { _revocation } from "./_revocation";
import { _errorArray } from "./_errorArray";
import { _setParameters } from "./_setParameters";

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
    private _initialConfig: IOAuth2Config = {};
    // private _jwks: IJwk[] | null = null;
    private _idToken: payloadType | null = null; // Api user id_token claims
    private _isIdTokenIntercepted = false;
    private _isAccessTokenIntercepted = false;

    get config() {
        return this._config;
    }
    get initialConfig() {
        return this._initialConfig;
    }
    // get jwks() {
    //     return this._jwks;
    // }
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
    readonly isAuthenticated = computed(() => this.idToken != null);

    constructor(
        @Inject(OAUTH2_CONFIG_TOKEN) protected oauth2Config?: IOAuth2Config
    ) {
        debugFn("mth", "CONSTRUCTOR", oauth2Config);

        const storedConfig = getStoreObject("config");
        const initialConfig = getStoreObject("initialConfig");
        // const jwks = getStoreObject("jwks");
        const idToken = getStoreObject("idToken");
        const config = storedConfig ?? oauth2Config ?? {};

        this._config = _oauth2ConfigFactory(config);
        this._initialConfig = initialConfig as IOAuth2Config;
        // this._jwks = jwks as IJwk[];
        this._idToken = idToken as payloadType;

        if (storedConfig) {
            debugFn("int", "STORED CONFIGURATION", storedConfig);
        }

        if (oauth2Config) {
            debugFn("int", "CONSTRUCTOR CONFIGURATION", oauth2Config);
        }

        if (oauth2Config && !storedConfig) {
            setStore("initialConfig", this.config);
        }
    }

    setConfig = (oauth2Config: IOAuth2Config) => {
        debugFn("mth", "SET_CONFIG", { ...oauth2Config });

        const config = _oauth2ConfigFactory(oauth2Config);

        debugFn(
            "int",
            "SET_CONFIG INTERNAL",
            JSON.stringify(oauth2Config, null, 4),
            JSON.stringify(config, null, 4)
        );

        this._config = config;
        this._initialConfig = config;
        // this._jwks = null;
        this._idToken = null;

        // TODO: no-storage configuration option

        // setStore("initialConfig", oauth2Config);
        setStore("config", config);
        setStore("initialConfig", config);
        // setStore("discoveryDoc");
        // setStore("jwks");
        setStore("idToken");
        setStore("test");

        return this.config;
    };

    setParameters = (parameters: IOAuth2Parameters) => {
        debugFn("mth", "SET_PARAMETERS", { ...parameters });

        // for (const parm in parameters) {
        //     const key = parm as keyof IOAuth2Parameters;
        //     const value = parameters[key] as any;

        //     if (value === undefined || value === null)
        //         delete this._config.parameters[key];
        //     else this._config.parameters[key] = value;
        // }

        const parms = { ...parameters };
        const configParms = { ...this._config.parameters };

        for (const parm in parameters) {
            const key = parm as keyof IOAuth2Parameters;
            const value = parameters[key] as any;

            if (value === undefined || value === null) {
                delete parms[key];
                delete configParms[key];
            }
        }

        parameters = _setParameters(parms, "setParameters");

        this._config.parameters = { ...configParms, ...parameters };

        // TODO: no-storage configuration option
        setStore("config", this.config);
    };

    removeIdToken = () => {
        debugFn("mth", "REMOVE_ID_TOKEN");

        this._idToken = null;
        setStore("idToken");
    }

    // fetchDiscoveryDoc = async (options = <customParametersType>{}) => {
    fetchDiscoveryDoc = async () => {
        debugFn("mth", "FETCH_DISCOVERY_DOC");

        return _fetchDiscoveryDoc(
            this.http,
            this._config // Parameter passed by reference and updated (config.metadata)
            //toLowerCaseProperties(options)
        );
    };

    authorization = async (options = <customParametersType>{}) => {
        debugFn("mth", "AUTHORIZATION");

        return _authorization(
            this.http,
            this._config, // Parameter passed by reference and updated (config.parameters)
            toLowerCaseProperties(options)
        );
    };

    token = async (options = <customParametersType>{}) => {
        debugFn("mth", "TOKEN");

        return _token(
            this.http,
            this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "authorization_code",
                ...toLowerCaseProperties(options),
            }
        );
    };

    refresh = async (options = <customParametersType>{}) => {
        debugFn("mth", "REFRESH");

        return _token(
            this.http,
            this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "refresh_token",
                ...toLowerCaseProperties(options),
            }
        );
    };

    revocation = async (options = <customParametersType>{}) => {
        debugFn("mth", "REVOCATION");

        return _revocation(
            this.http,
            this._config, // Parameter passed by reference and could be updated (config.parameters)
            toLowerCaseProperties(options)
        );
    };

    verify_token = async (options = <customParametersType>{}) => {
        debugFn("mth", "VERIFY_TOKEN");

        this._idToken = null;
        // TODO: no-storage configuration option
        setStore("idToken");

        const idToken = {};
        const res = _verify_token(
            this.config,
            idToken, // Parameter passed by reference and updated (this.idToken)
            toLowerCaseProperties(options)
        );

        this._idToken = idToken;

        return res;
    };

    interceptor = async () => {
        debugFn("mth", "INTERCEPTOR");

        const int = _interceptor(
            this._config // Parameter passed by reference and updated (config.parameters)
        );

        await int.then(v => {
            this._isIdTokenIntercepted = !!v.id_token;
            this._isAccessTokenIntercepted = !!v.access_token;
        });

        return int;
    };

    errorArray = (err: unknown) => {
        return _errorArray(err);
    };
}


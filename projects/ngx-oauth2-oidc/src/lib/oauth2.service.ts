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
    stringsObject,
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
import { catchError, filter, fromEvent, map, tap } from "rxjs";
import { _api_request } from "./_apiReguest";
import { _save_state } from "./_saveState";
import { _recover_state } from "./_recoverState";

export const OAUTH2_CONFIG_TOKEN = new InjectionToken<IOAuth2Config>(
    "OAuth2 Config"
);

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
    private _worker?: Worker;
    // = new Worker(
    //     //"data:text/javascript;charset=US-ASCII,onmessage%20%3D%20function%28event%29%20%7B%0A%20%20const%20url%20%3D%20event.data.url%3B%0A%20%20const%20options%20%3D%20event.data.options%3B%0A%0A%20%20fetch%28url%2C%20options%29%0A%20%20%20%20.then%28response%20%3D%3E%20%7B%0A%20%20%20%20%20%20%2F%2F%20Process%20the%20response%20data%0A%20%20%20%20%20%20const%20responseData%20%3D%20response.json%28%29%3B%0A%20%20%20%20%20%20self.postMessage%28responseData%29%3B%0A%20%20%20%20%7D%29%0A%20%20%20%20.catch%28error%20%3D%3E%20%7B%0A%20%20%20%20%20%20console.error%28%27Error%3A%27%2C%20error%29%3B%0A%20%20%20%20%20%20self.postMessage%28%7B%20error%3A%20error.message%20%7D%29%3B%0A%20%20%20%20%7D%29%3B%0A%7D%3B"
    //     "data:text/javascript;charset=US-ASCII,onmessage%20%3D%20function%20%28oEvent%29%20%7B%0A%09postMessage%28%7B%0A%09%09%22id%22%3A%20oEvent.data.id%2C%0A%09%09%22evaluated%22%3A%20eval%28oEvent.data.code%29%0A%09%7D%29%3B%0A%7D"
    // );
    private _workerListeners: (Function | null | string)[] = [];
    private isWorkerAvailable = () =>
        !!this._worker && !!this._worker?.terminate;
    private useWebWorked = () => {
        const isWorkerAvailable = this.isWorkerAvailable();
        const no_worker = !!this._config.configuration?.no_worker;

        if (!no_worker && !isWorkerAvailable) {
            console.error(
                "Web workers are not available. HttpClient will be used."
            );
        }

        return !no_worker && isWorkerAvailable;
    };

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

    private callWorker = (
        options: {
            url: string;
            headers: jsonObject;
            parameters: stringsObject;
            body: payloadType;
            method: string;
        },
        listener: Function | null | string = null
    ) => {
        if (!this._worker || !this._worker?.terminate)
            throw "Web worker is not running";

        const lst = this._workerListeners;
        const idx = lst.findIndex(v => v === "@@empty");
        const id = idx < 0 ? lst.length : idx;

        if (id == idx) lst[id] = listener;
        else lst.push(listener);

        const observable$ = fromEvent<MessageEvent>(
            this._worker,
            "message"
        ).pipe(
            tap(
                ev =>
                    ev.data.type === "redirect" && (location.href = ev.data.url)
            ),
            filter(ev => ev.data.id === id),
            tap(ev => {
                const execute =
                    lst[id] !== "@@empty" &&
                    typeof lst[id] !== "string" &&
                    lst[id] !== null;
                execute &&
                    (lst[id] as Function)({
                        data: ev.data.data,
                        error: ev.data.error,
                    });
                lst[id] = "@@empty";
                id === lst.length - 1 && lst.pop();
            }),
            map(ev => {
                delete ev.data.id;
                return { data: ev.data.data, error: ev.data.error };
            }),
            catchError(err => {
                throw err;
            })
        );

        this._worker?.postMessage({ id, options });
        return observable$;
    };

    setWorker = async (code: string) => {
        if (typeof Worker === "undefined") {
            console.error("Web workers are not available");
            return;
        }

        this._worker = new Worker(code);

        if (!this._worker?.terminate) {
            console.error("Web worker is not running");
            return;
        }

        this._worker.onerror = event => {
            console.error("Web worker error", event);
        };

        this._workerListeners = [];
    };

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
    fetchDiscoveryDoc = (
        customParameters = <customParametersType>{},
        url?: string
    ) => {
        return _fetchDiscoveryDoc(
            this.useWebWorked() ? this.callWorker : this.http,
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
     * @param customParameters
     * @param statePayload
     * @param url
     * @returns
     */
    authorization = async (
        customParameters = <customParametersType>{},
        statePayload?: string,
        url?: string
    ) => {
        return _authorization(
            this.useWebWorked() ? this.callWorker : this.http,
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
            this.useWebWorked() ? this.callWorker : this.http,
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
            this.useWebWorked() ? this.callWorker : this.http,
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
            this.useWebWorked() ? this.callWorker : this.http,
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
            this.useWebWorked() ? this.callWorker : this.http,
            this._config, // Parameter passed by reference and could be updated (config.parameters)
            customParameters,
            url
        );
    };

    verify_token = async (
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

    saveState = async () =>
        await _save_state(this._config, this._idToken);

    recoverState = async () => {
        await _recover_state(this._config, this._idToken);
    };

    errorArray = (err: unknown) => {
        return _errorArray(err);
    };
}

import { InjectionToken } from "@angular/core";
import { IOAuth2Config, IOAuth2Parameters, customParametersType, jsonObject, methodType, payloadType } from "../domain";
import * as i0 from "@angular/core";
export declare const OAUTH2_CONFIG_TOKEN: InjectionToken<IOAuth2Config>;
export declare class Oauth2Service {
    protected oauth2Config?: IOAuth2Config | undefined;
    private readonly http;
    private _config;
    private _idToken;
    private _isIdTokenIntercepted;
    private _isAccessTokenIntercepted;
    private _isCodeIntercepted;
    get config(): IOAuth2Config;
    get idToken(): jsonObject;
    get isIdTokenIntercepted(): boolean;
    get isAccessTokenIntercepted(): boolean;
    get isCodeIntercepted(): boolean;
    constructor(oauth2Config?: IOAuth2Config | undefined);
    setConfig: (oauth2Config: IOAuth2Config) => IOAuth2Config | undefined;
    setParameters: (parameters: IOAuth2Parameters) => void;
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
    fetchDiscoveryDoc: (customParameters?: customParametersType, url?: string) => Promise<import("../domain").IOAuth2Metadata>;
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
    authorization: (customParameters?: customParametersType, statePayload?: string, url?: string) => Promise<IOAuth2Parameters>;
    token: (customParameters?: customParametersType, url?: string) => Promise<import("../domain").IOAuth2Metadata | IOAuth2Parameters>;
    apiRequest: (customParameters?: customParametersType, url?: string, method?: methodType, headers?: jsonObject, body?: payloadType) => Promise<unknown>;
    refresh: (customParameters?: customParametersType, url?: string) => Promise<import("../domain").IOAuth2Metadata | IOAuth2Parameters>;
    revocation: (customParameters?: customParametersType, url?: string) => Promise<import("../domain").IOAuth2Metadata | IOAuth2Parameters>;
    verify_token: (customParameters?: customParametersType, issuer?: string, jwks_uri?: string) => Promise<void>;
    interceptor: () => Promise<IOAuth2Parameters>;
    saveState: () => Promise<void>;
    recoverState: () => Promise<void>;
    errorArray: (err: unknown) => [string, any][];
    static ɵfac: i0.ɵɵFactoryDeclaration<Oauth2Service, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Oauth2Service>;
}
//# sourceMappingURL=oauth2.service.d.ts.map
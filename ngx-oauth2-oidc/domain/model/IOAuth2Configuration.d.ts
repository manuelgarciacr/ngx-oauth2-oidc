/** Configuration object */
declare const configuration: {
    /** File tag */
    tag: string;
    /**
     * Authorizationn grant values:
     *
     *  'code': Authorization code grant. Default value.
     *  'implicit': Implicit grant,
     *  'hybrid': Code and implicit mixed grant,
     *  'free: Parameters are not modified by the configuration options (config.configuration)
     *      or by other parameters.
     *
     */
    authorization_grant: "code" | "implicit" | "hybrid" | "free";
    /**
     * If true, discovery document is not fetched. Default is false.
     */
    /**
     * If true, the service will not use PKCE support. Default is false.
     */
    no_pkce: boolean;
    /**
     * If true, the service will not use the oauth2 parameter "state". Default is false.
     */
    no_state: boolean;
    /**
     * If true, the service will have access to the storage. Default is false.
     */
    storage: boolean;
    /**
     * If true, the methods return the request parameters along with the response.
     */
    test: boolean;
    /**
     * If true, the revocation endpoint includes the the token in the authorization
     *  header. Default is false.
     */
    revocation_header: boolean;
    /**
     * Predefined discovery document URI.
     */
    discovery_endpoint: string;
    /**
     * Default is ".well-known/openid-configuration". Ignored if
     *      "discovery_endpoint" is defined. Sufix for the default
     *      discovery document URI.
     */
    well_known_sufix: string;
    /**
     * 'Content-Type' header value for GET/POST requests (without HREF
     *      redirection) from endpoints. Default "application/x-www-form-urlencoded".
     */
    content_type: string;
};
/** Options object type */
export interface IOAuth2Configuration extends Partial<typeof configuration> {
}
/** Option names */
export declare const configurationOptions: string[];
/** Authorization grant values */
export declare const authorizationGrantValues: readonly ["code", "implicit", "hybrid", "free"];
export {};
//# sourceMappingURL=IOAuth2Configuration.d.ts.map
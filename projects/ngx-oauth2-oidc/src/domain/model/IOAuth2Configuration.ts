import { authorizationGrantType } from "..";

/** Configuration object */
const configuration = {
    /** File tag */
    tag: "",

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
    authorization_grant: "" as authorizationGrantType,

    /**
     * If true, discovery document is not fetched. Default is false.
     */
    // no_discovery: false,

    /**
     * If true, the service will not use PKCE support. Default is false.
     */
    no_pkce: false,

    /**
     * If true, the service will not use the oauth2 parameter "state". Default is false.
     */
    no_state: false,

    /**
     * If true, the service will have access to the storage. Default is false.
     */
    storage: false,

    /**
     * If true, the methods return the request parameters along with the response.
     */
    test: false,

    /**
     * If true, the revocation endpoint includes the the token in the authorization
     *  header. Default is false.
     */
    revocation_header: false,

    /**
     * Predefined discovery document URI.
     */
    discovery_endpoint: "",

    /**
     * Default is ".well-known/openid-configuration". Ignored if
     *      "discovery_endpoint" is defined. Sufix for the default
     *      discovery document URI.
     */
    well_known_sufix: "",

    /**
     * 'Content-Type' header value for GET/POST requests (without HREF
     *      redirection) from endpoints. Default "application/x-www-form-urlencoded".
     */
    content_type: "",
};

/** Options object type */
export interface IOAuth2Configuration extends Partial<typeof configuration> {}

/** Option names */
export const configurationOptions = Object.keys(configuration);

/** Authorization grant values */
export const authorizationGrantValues = [
    "code", "implicit", "hybrid", "free"
] as const;

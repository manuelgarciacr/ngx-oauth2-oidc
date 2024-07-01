/** Options object */
const options = {
    /** File tag */
    tag: "",

    /**
     * Authorizationn grant values:
     *
     *  code: authorization code grant,
     *  implicit: implicit grant,
     *  password: resource owner password credentials grant,
     *  client: client credentials grant,
     *  extension: additional grant types
     *  uma: User-Managed Access
     */
    authorization_grant: "" as authorizationGrantType,

    /**
     * If true, discovery document is not fetched. Default is false.
     */
    no_discovery: false,

    /**
     * If true, the service will not use PKCE support. Default is false.
     */
    no_pkce: false,

    /**
     * If true, the service will not use the oauth2 parameter "state". Default is false.
     */
    no_state: false,

    /**
     * If true, the service will not use the oauth2 parameter "nonce". Default is false.
     */
    no_nonce: false,

    /**
     * Predefined discovery document URI. Ignored if "no_discovery"
     */
    discovery_endpoint: "",

    /**
     * Default is ".well-known/openid-configuration". Ignored if
     *      "discovery_endpoint" is defined. Ignored if "no_discovery".
     *      Sufix for the default discovery document URI.
     */
    well_known_sufix: "",
};

/** Options object type */
export interface IOAuth2Options extends Partial<typeof options> {}

/** Option names */
export const optionNames = Object.keys(options);

/** Authorization grant values */
export const authorizationGrantValues = [
    "code", "implicit" //, "password", "client", "extension",
] as const;

/** Authorization */
export type authorizationGrantType = typeof authorizationGrantValues[number];

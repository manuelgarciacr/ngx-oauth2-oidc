import { IOAuth2Config, IOAuth2Parameters } from "../index";
import { Modify } from "../../utils";

// /** Oauth2 custom parameter name type */
// export type customParameterName = string;

// /** Oauth2 parameter name type */
// export type parameterName = keyof IOAuth2Parameters;

/** Oauth2 parameter type */
export type parameterType = boolean | string | number | string[] | null;

/** Oauth2 custom parameters type */
export type customParameters = {
    [key: string]: parameterType;
};

/** Internal configuration object type */
export type oauth2Configuration = Modify<
    IOAuth2Configuration,
    {
        /** Initial configuration object */
        config?: Partial<IOAuth2Config>;
        authorization_custom: customParameters;
        authorization_params: (keyof IOAuth2Parameters)[];
        token_custom: customParameters;
        token_params: (keyof IOAuth2Parameters)[];
        refresh_custom: customParameters;
        refresh_params: (keyof IOAuth2Parameters)[];
        revocation_custom: customParameters;
        revocation_params: (keyof IOAuth2Parameters)[];
    }
>;

/** Initial external configuration object type */
export interface IOAuth2Configuration {
    /** File tag */
    tag: string;

    /**
     * Authorizationn grant types:
     *
     *  code: authorization code grant,
     *  implicit: implicit grant,
     *  password: resource owner password credentials grant,
     *  client: client credentials grant,
     *  extension: additional grant types
     */
    authorization_grant_type:
        | "code"
        | "implicit"
        | "password"
        | "client"
        | "extension";

    // no_discovery: If true, discovery document is not fetched
    no_discovery?: boolean;

    // forze_values: Ignored if no_discovery
    // forze_values: If true, configuration values are not overwritted
    //      by the fetched discovery document (if any)
    //forze_values?: boolean;

    // well_known_sufix: Default is ".well-known/openid-configuration"
    // well_known_sufix: Ignored if discovery_endpoint is defined
    // well_known_sufix: Ignored if no_discovery
    // well_known_sufix: Sufix for the default discovery document URI
    well_known_sufix: string;

    // discovery_endpoint: Predefined discovery document URI
    // discovery_endpoint: Ignored if no_discovery
    discovery_endpoint?: string;

    // no_pkce: Default is false
    // no_pkce: If true, the service will not use PKCE support
    no_pkce?: boolean;

    authorization?: { [key: string]: parameterType };

    token?: { [key: string]: parameterType };

    refresh?: { [key: string]: parameterType };

    revocation?: { [key: string]: parameterType };

    // authorization_params: Authorization request oauth parameter names.
    authorization_params?: (
        | keyof IOAuth2Parameters
        | [string, parameterType]
    )[];

    // token_custom: Names and values of the token request custom parameters
    // token_custom?: customParameters;

    // token_params: Token request oauth parameter names.
    token_params?: (keyof IOAuth2Parameters | [string, parameterType])[];

    // refresh_params: Refresh token request oauth parameter names.
    refresh_params?: (keyof IOAuth2Parameters | [string, parameterType])[];

    // revocation_params: Revocation token request oauth parameter names.
    revocation_params?: (keyof IOAuth2Parameters | [string, parameterType])[];

    // id_token_verify: token validation claims
    id_token_verify?: customParameters;
}

import { endpointNames } from "../index";

// /** Oauth2 custom parameter name type */
// export type customParameterName = string;

// /** Oauth2 parameter name type */
// export type parameterName = keyof IOAuth2Parameters;

export const authorithationGrantValues = [
    "code", "implicit" //, "password", "client", "extension",
] as const;

export type authorithationGrantType = typeof authorithationGrantValues[number];

/** Oauth2 parameter type */
export type parameterType = boolean | string | number | string[] | null;

/** Oauth2 custom parameters type */
export type customParametersType = {
    [key: string]: parameterType;
};

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
    authorization_grant_type: authorithationGrantType;

    // well_known_sufix: Default is ".well-known/openid-configuration"
    // well_known_sufix: Ignored if discovery_endpoint is defined
    // well_known_sufix: Ignored if no_discovery
    // well_known_sufix: Sufix for the default discovery document URI
    well_known_sufix: string;

    // discovery_endpoint: Predefined discovery document URI
    // discovery_endpoint: Ignored if no_discovery
    discovery_endpoint?: string;

    // no_discovery: If true, discovery document is not fetched
    no_discovery?: boolean;

    // forze_values: Ignored if no_discovery
    // forze_values: If true, configuration values are not overwritted
    //      by the fetched discovery document (if any)
    //forze_values?: boolean;

    // no_pkce: Default is false
    // no_pkce: If true, the service will not use PKCE support
    no_pkce?: boolean;

    authorization?: customParametersType;

    token?: customParametersType;

    refresh?: customParametersType;

    revocation?: customParametersType;

    // verify_token: jose token validation claims
    verify_token?: customParametersType;

    // authorization_params: Authorization request oauth parameter names.
    // authorization_params?: (
    //     | keyof IOAuth2Parameters
    //     | [string, parameterType]
    // )[];

    // token_custom: Names and values of the token request custom parameters
    // token_custom?: customParameters;

    // token_params: Token request oauth parameter names.
    // token_params?: (keyof IOAuth2Parameters | [string, parameterType])[];

    // refresh_params: Refresh token request oauth parameter names.
    // refresh_params?: (keyof IOAuth2Parameters | [string, parameterType])[];

    // revocation_params: Revocation token request oauth parameter names.
    // revocation_params?: (keyof IOAuth2Parameters | [string, parameterType])[];
}

export const configurationOptions = [
    "tag",
    "authorization_grant_type",
    "well_known_sufix",
    "discovery_endpoint",
    "no_discovery",
    "no_pkce",
    ...endpointNames
];

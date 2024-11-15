import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
    parameterType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { _setParameters } from "./_setParameters";

// TODO: no-storage configuration option

/**
 * Access token revocation within configuration. If the parameter token_type_hint
 *   is equal to 'refresh_token' and the refresh_token exists, it is revoked. Default
 *   revokes access token; otherwise, the refresh token. You can indicate the option token,
 *   access_token or update_token.
 *
 * @param http HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      could be updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _revocation = async (
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and could be updated (configuration.parameters)
    customParameters = <customParametersType>{},
    url?: string
) => {
    // Configuration options
    const test = config.configuration?.test;
    // Metadata fields
    const revocation_endpoint = config.metadata?.revocation_endpoint;
    // url
    url ??= revocation_endpoint ?? "";
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("revocation", config),
        ...customParameters,
    });
    const token_type_hint = parms["token_type_hint"];
    const access_token = parms["access_token"];
    const refresh_token = parms["refresh_token"];
    let token = parms["token"] as parameterType | undefined;

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //

    if (!url)
        throw new Error(
            `Missing value for option 'url' or metadata field 'revocation_endpoint'.`,
            { cause: "oauth2 revocation" }
        );

    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //

    // TOKEN & ACCESS_TOKEN & REFRESH_TOKEN

    delete parms["access_token"];
    delete parms["refresh_token"];
    token =
        parms["token"] ??
        (!token_type_hint
            ? undefined
            : token_type_hint == "refresh_token"
            ? refresh_token
            : access_token) ??
        (!token_type_hint ? access_token ?? refresh_token : undefined);

    // TOKEN ERRORS

    if (token_type_hint && !token)
        throw new Error(
            `The token indicated by the token_type_hint is missing.`,
            { cause: "oauth2 revocation" }
        );

    if (!token)
        throw new Error(
            `Missing value for parameters 'token' or 'access_token' or 'refresh_token'.`,
            { cause: "oauth2 revocation" }
        );

    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////

    return request<IOAuth2Parameters>(
        "POST",
        url,
        http,
        config,
        token ? { ...parms, token } : parms,
        "revocation"
    );
};

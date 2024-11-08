import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";

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
 * @param options Custom parameters for the request.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _revocation = async (
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and could be updated (configuration.parameters)
    options = <customParametersType>{}
) => {
    const test = config.configuration?.test;
    const parms = {
        ...getParameters("revocation", config),
        ...options,
    } as customParametersType;
    const meta = config.metadata!;
    const url = (options["url"] as string) ?? meta.revocation_endpoint ?? "";

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    if (!url)
        throw new Error(
            `Values ​​for metadata 'revocation_endpoint' and option 'url' are missing.`,
            { cause: "oauth2 revocation" }
        );

    const token_type_hint = parms["token_type_hint"];
    const access_token = parms["access_token"];
    const refresh_token = parms["refresh_token"];

    let token =
        options["token"] ??
        options["access_token"] ??
        options["refresh_token"] ??
        (!access_token ||
        (token_type_hint == "refresh_token" && !!refresh_token)
            ? refresh_token
            : access_token);

    if (!token)
        throw new Error(
            `Values ​​for parameters "access_token" and "refresh_token" and option 'token' are missing.`,
            { cause: "oauth2 revocation" }
        );

    delete parms["access_token"];
    delete parms["refresh_token"];

    return request<IOAuth2Parameters>(
        "POST",
        url,
        http,
        config!,
        { ...parms, token },
        "revocation"
    );
};

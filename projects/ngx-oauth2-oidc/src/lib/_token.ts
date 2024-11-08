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
 * Request to the token endpoint. Returns the tokens and othe date returned by
 *   the endpoint and saves it in the configuration parameters (in memory and storage).
 *   HttpClient post request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param http HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param options Custom parameters for the request.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _token = async (
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and updated (configuration.parameters)
    options = <customParametersType>{}
) => {
    const test = config.configuration?.test;
    const no_pkce = !!config.configuration?.no_pkce;
    const parms = {
        ...getParameters("token", config),
        ...options,
    } as customParametersType;
    const meta = config.metadata!;
    const url = (options["url"] as string) ?? meta.token_endpoint ?? "";
    const grant_type = parms["grant_type"];

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    if (!grant_type)
        throw new Error(`Value ​​for option 'grant_type' is missing.`, {
            cause: `oauth2 token`,
        });

    if (!url)
        throw new Error(
            `Values ​​for metadata 'token_endpoint' and option 'url' are missing.`,
            { cause: `oauth2 token ${grant_type}` }
        );

    if (grant_type == "authorization_code") {
        delete parms["assertion"];
        //delete parms["client_assertion"];
        delete parms["device_code"];
        delete parms["refresh_token"];
    }

    if (grant_type == "refresh_token") {
        delete parms["assertion"];
        //delete parms["client_assertion"];
        delete parms["code"];
        delete parms["code_verifier"];
        delete parms["device_code"];
    }

    if (no_pkce) {
        delete parms["code_verifier"];
    }

    return request<IOAuth2Parameters>(
        "POST",
        url,
        http,
        config!,
        parms,
        "token"
    );
};

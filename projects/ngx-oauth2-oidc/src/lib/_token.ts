import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { _setParameters } from "./_setParameters";

/**
 * Request to the token endpoint. Returns the tokens and othe date returned by
 *   the endpoint and saves it in the configuration parameters (in memory and storage).
 *   HttpClient post request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param http HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _token = async (
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and updated (configuration.parameters)
    customParameters = <customParametersType>{},
    url?: string
) => {
    // Configuration options
    const test = config.configuration?.test;
    const no_pkce = !!config.configuration?.no_pkce;
    // Metadata fields
    const token_endpoint = config?.metadata?.token_endpoint;
    // url
    url ??= token_endpoint ?? "";
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("token", config),
        ...customParameters,
    });
    const grant_type = parms["grant_type"];

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //

    if (!url)
        throw new Error(
            `Missing Value ​​for metadata field 'token_endpoint' or option 'url'.`,
            { cause: `oauth2 token ${grant_type}` }
        );

    if (!grant_type)
        throw new Error(
            `Missing value ​​for configuration parameter 'grant_type'.`,
            {
                cause: `oauth2 token`,
            }
        );

    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //

    if (grant_type == "authorization_code") {
        delete parms["assertion"];
        delete parms["device_code"];
        delete parms["refresh_token"];
    }

    if (grant_type == "refresh_token") {
        delete parms["assertion"];
        delete parms["code"];
        delete parms["code_verifier"];
        delete parms["device_code"];
    }

    if (no_pkce) {
        delete parms["code_verifier"];
    }

    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////

    return request<IOAuth2Parameters>(
        "POST",
        url,
        http,
        config,
        parms,
        "token"
    );
};

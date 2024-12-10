import { IOAuth2Config, IOAuth2Parameters, customParametersType } from "../domain";
import { HttpClient } from "@angular/common/http";
/**
 * Request to the token endpoint. Returns the tokens and othe date returned by
 *   the endpoint and saves it in the configuration parameters (in memory and storage).
 *   HttpClient post request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object or worker request
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export declare const _token: (request: HttpClient, config: IOAuth2Config, customParameters?: customParametersType, url?: string) => Promise<import("../domain").IOAuth2Metadata | IOAuth2Parameters>;
//# sourceMappingURL=_token.d.ts.map
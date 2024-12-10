import { IOAuth2Config, IOAuth2Parameters, customParametersType } from "../domain";
import { HttpClient } from "@angular/common/http";
/**
 * Request to then OAuth2 authorization endpoint. Redirects to the endpoint.
 *   The interceptor function inside the onInit method gets the response and actualizes
 *   the config.parameters. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param statePayload Payload to add to state parameter
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export declare const _authorization: (request: HttpClient, config: IOAuth2Config, customParameters?: customParametersType, statePayload?: string, url?: string) => Promise<IOAuth2Parameters>;
//# sourceMappingURL=_authorization.d.ts.map
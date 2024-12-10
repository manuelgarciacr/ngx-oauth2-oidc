import { HttpClient } from "@angular/common/http";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Methods, IOAuth2Parameters, customParametersType } from "../domain";
/**
 * Request to an OAuth2 endpoint. Redirects to the endpoint or makes a HttpClient
 *   get or post request.
 *
 * @param method Request method ("""HREF" for redirection)
 * @param url Endpoint URL
 * @param {HttpClient} request- HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param customParameters OAuth2 parameters (standard and custom) for the request. (payload)
 * @param endpoint Endpoint name (for error messages and to determine the type of response)
 * @returns Promise with the request response (or error). In test mode the promise
 *      returns an array with the response (or error) and the request payload.
 */
export declare const request: <T>(method: "HREF" | "GET" | "POST", url: string, request: HttpClient, config: IOAuth2Config, customParameters: customParametersType | undefined, endpoint: keyof IOAuth2Methods) => Promise<IOAuth2Parameters | IOAuth2Metadata>;
//# sourceMappingURL=_request.d.ts.map
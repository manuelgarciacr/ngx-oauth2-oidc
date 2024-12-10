import { Observable } from "rxjs";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Parameters, payloadType } from "../domain";
/**
 * Gets an HttpClient get or post request response. If "areParameters" is true (default)
 *   the response is converted to IOAuth2Parameters and actualizes config.parameters.
 *   Otherwise, the response actualizes config.metadata.
 *
 * @param request HttpClient get or post method response. (Observable)
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param areParameters If true (default), the response is converted to IOAuth2Parameters
 *      and actualizes config.parameters. If false, the response actualizes config.metadata
 * @returns Promise with the request response (or error).
 */
export declare const httpRequest: (request: Observable<payloadType>, config: IOAuth2Config, areParameters?: boolean) => Promise<IOAuth2Parameters | IOAuth2Metadata>;
//# sourceMappingURL=_httpRequest.d.ts.map
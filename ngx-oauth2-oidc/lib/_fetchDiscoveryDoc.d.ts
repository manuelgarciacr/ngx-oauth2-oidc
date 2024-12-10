import { customParametersType, IOAuth2Config, IOAuth2Metadata } from "../domain";
import { HttpClient } from "@angular/common/http";
/**
 * Request to the discovery endpoint. Returns the discovery document and saves
 *   the metadata in the configuration object (in memory and storage). HttpClient
 *   get request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Metadata or error)
 */
export declare const _fetchDiscoveryDoc: (request: HttpClient, config: IOAuth2Config, customParameters?: customParametersType, url?: string) => Promise<IOAuth2Metadata>;
//# sourceMappingURL=_fetchDiscoveryDoc.d.ts.map
import { IOAuth2Config, IOAuth2Parameters, customParametersType } from "../domain";
import { HttpClient } from "@angular/common/http";
/**
 * Access token revocation within configuration. If the parameter token_type_hint
 *   is equal to 'refresh_token' and the refresh_token exists, it is revoked. Default
 *   revokes access token; otherwise, the refresh token. You can indicate the option token,
 *   access_token or update_token.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      could be updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export declare const _revocation: (request: HttpClient, config: IOAuth2Config, customParameters?: customParametersType, url?: string) => Promise<import("../domain").IOAuth2Metadata | IOAuth2Parameters>;
//# sourceMappingURL=_revocation.d.ts.map
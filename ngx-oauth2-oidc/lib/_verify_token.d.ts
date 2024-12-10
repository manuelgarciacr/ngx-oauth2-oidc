import { JWTPayload } from "jose";
import { IOAuth2Config, customParametersType } from "../domain";
/**
 * Verification of the id_token saved in the configuration. Makes use of the 'jose' library.
 *   Needs the "jwks_uri" and "issuer" metadata (see jose library). You also need the parameters.
 *   id_token, client_id, audience (or client_id) and nonce. This data can be overwritten by the
 *   options parameter data. Returns the payload of the id_token and saves it to storage and
 *   memory. In test mode, the request payload is also stored inside sessionStorage.
 *
 * @param config Configuration object saved in memory.
 * @param customParameters Custom parameters for the request. May include values ​​to override 'jwks_uri'
 *      and 'issuer' metadata.
 * @param issuer Authorization server's issuer identifier URL
 * @param jwks_uri URL of the authorization server's JWK Set document
 * @returns The Promise with the id_token payload or error
 */
export declare const _verify_token: (config: IOAuth2Config, customParameters?: customParametersType, _issuer?: string, _jwks_uri?: string) => Promise<JWTPayload | undefined>;
//# sourceMappingURL=_verify_token.d.ts.map
import { IOAuth2Config } from "../domain";
/**
 * Processes an initial external configuration object (IOAuth2Config type) and
 *   converts it in the internal configuration object (oauth2Config type).
 *   Converts all undefined booleans to false. Removes all undefined fields. Trims
 *   all string values and removes empty fields. Converts all string[] to
 *   non-empty strings array.
 *
 * @param ioauth2Config The initial external configuration object
 * @returns The internal configuration object
 */
export declare const _oauth2ConfigFactory: (ioauth2Config?: IOAuth2Config) => IOAuth2Config;
//# sourceMappingURL=_oauth2ConfigFactory.d.ts.map
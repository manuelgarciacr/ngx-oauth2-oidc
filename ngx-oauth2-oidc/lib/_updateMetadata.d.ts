import { IOAuth2Config, IOAuth2Metadata } from "../domain";
/**
 * Gets an object of string type parameters and saves the new configuration metadata.
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @returns An IOAuth2Parameters object
 */
export declare const updateMetadata: (obj: {
    [key: string]: string;
}, config: IOAuth2Config) => IOAuth2Metadata;
//# sourceMappingURL=_updateMetadata.d.ts.map
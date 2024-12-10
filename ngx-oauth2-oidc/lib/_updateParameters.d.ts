import { IOAuth2Config, IOAuth2Parameters } from "../domain";
/**
 * Converts an object of string type parameters to an IOAuth2Parameters object
 *   and saves the new configuration parameters. Converts the "expires_in" parameter
 *   in a Epoch date (milliseconds)
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @returns An IOAuth2Parameters object
 */
export declare const updateParameters: (obj: {
    [key: string]: string;
}, config: IOAuth2Config) => IOAuth2Parameters;
//# sourceMappingURL=_updateParameters.d.ts.map
import { IOAuth2Config, IOAuth2Methods, customParametersType } from "../domain";
/**
 * Returns the parameters defined within the configuration object
 *   (standard and custom parameters) that are appropriate for
 *   the indicated method. Remove null or undefined
 *   values. Custom parameters overwrite standar parameters.
 *
 * @param method Method name
 * @param config Configuration object
 * @returns Object with the parameters for the method
 */
export declare const getParameters: (method: keyof IOAuth2Methods, config: IOAuth2Config) => customParametersType;
//# sourceMappingURL=_getParameters.d.ts.map
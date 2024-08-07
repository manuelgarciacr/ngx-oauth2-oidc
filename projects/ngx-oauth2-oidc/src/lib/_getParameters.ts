import { IOAuth2Config, IOAuth2Methods, IOAuth2Parameters, customParametersType, parameterNames } from "../domain";
import "../utils/objectFilter";

/**
 * Returns the parameters defined within the configuration object
 *      (standard and custom parameters) that are appropriate for
 *      the indicated method. Remove null or undefined
 *      values. Custom parameters overwrite standar parameters.
 *
 * @param method Method name
 * @param config Configuration object
 * @returns Object with the parameters for the method
 */
export const getParameters = (
    method: keyof IOAuth2Methods,
    config: IOAuth2Config
): customParametersType => {
    const parameters = config.parameters!;
    const customParams = config[method] ?? {};
    const standardParms = getStandardParameters(method, parameters);
    const _parms = { ...standardParms, ...customParams } as {[key: string]: unknown};
    const parms = _parms.filter((_: string, value: unknown) => value != null)

    return parms as customParametersType;
};

/**
 * Returns the parameters defined within the configuration object
 *      (standard parameters) that are appropriate for the indicated
 *      method. Removes null or undefined parameters.
 *
 * @param method Method name
 * @param parameters Standard configuration parameters
 * @returns Object with the standard parameters for the method
 */
const getStandardParameters = (
    method: keyof typeof parameterNames,
    parameters: IOAuth2Parameters
) => {
    const names = parameterNames[method];
    // TODO: Object.filter
    // const parms = Object.fromEntries(
    //     Object.entries(parameters).filter(([key]) => names.includes(key))
    // );
    const parms = parameters.filter(key => names.includes(key));

    return parms as IOAuth2Parameters;
};

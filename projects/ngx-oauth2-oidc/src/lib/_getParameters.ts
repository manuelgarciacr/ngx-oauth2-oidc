import { IOAuth2Config, IOAuth2Methods, IOAuth2Parameters, customParametersType, parameterNames } from "../domain";
//import "../utils/objectFilter";

interface IFilter {
    filter(predicate: (key: string, value: any, object: object) => any): {
        [key: string]: unknown;
    };
}

const attributes = {
    // @ts-expect-error
    value: function (
        predicate: (key: string, value: any, object: object) => any
    ) {
        const entries = Object.entries(this);
        return Object.fromEntries(
            entries.filter(value => predicate(value[0], value[1], this))
        );
    },
    enumerable: false, // this is actually the default
};

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
    const parameters = config.parameters ?? {};
    const customParams = config[method] ?? {};
    const standardParms = getStandardParameters(method, parameters);
    // const _parms = { ...standardParms, ...customParams } as {
    //     [key: string]: unknown;
    // };
    const _parms = { ...standardParms, ...customParams };
    Object.defineProperty(_parms, "filter", attributes);

    const parms = (_parms as IFilter).filter((_: string, value: unknown) => value != null);


    return parms as customParametersType;
};

/**
 * Returns the parameters defined within the configuration object
 *   (standard parameters) that are appropriate for the indicated
 *   method. Removes null or undefined parameters.
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

    Object.defineProperty(parameters, "filter", attributes);
    // @ts-ignore
    const parms = parameters.filter(key => names.includes(key));

    return parms as IOAuth2Parameters;
};

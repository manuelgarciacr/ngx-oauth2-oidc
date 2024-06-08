import { IOAuth2Config, IOAuth2Configuration, IOAuth2Parameters, authorithationGrantValues, configSections, configurationOptions, customParametersType, endpointNames, endpointParameters } from "../domain";
import { debugFn } from "../utils/debugFn";
import { isObject, toLowerCaseProperties } from "../utils";

/**
 * Processes an initial external configuration object (IOAuth2Config type) and
 *      converts it in the internal configuration object (oauth2Config type).
 * Converts all undefined booleans to false. Removes all undefined fields. Trims
 *      all string values and removes empty fields. Converts all string[] to
 *      non-empty strings array.
 *
 * @param val The initial external configuration object
 * @returns The internal configuration object
 */
export const oauth2ConfigFactory = (ioauth2Config = <IOAuth2Config>{}) => {
    debugFn("mth", "OAUTH2_CONFIG_FACTORY", ioauth2Config);

    const cfg = <IOAuth2Config>{}; // Internal configuration object

    ioauth2Config = toLowerCaseProperties(ioauth2Config)!;

    for (const section in ioauth2Config) {
        const key = section as keyof IOAuth2Config;
        const value = ioauth2Config[key];

        if (!isObject(value))
            throw `Oauth2 oauth2ConfigFactory: initial configuration section "${section}" is not an object.`;

        if (!configSections.includes(section))
            throw `Oauth2 oauth2ConfigFactory: unexpected initial configuration section "${section}".`;

        cfg[key] = toLowerCaseProperties<any>(value)!;
    }

    let newConfig = cfg.configuration ?? <IOAuth2Configuration>{};
    const parms = cfg.parameters;

    // Required configuration values

    if (!authorithationGrantValues.includes(newConfig.authorization_grant_type))
        throw `Oauth2 oauth2ConfigFactory: missing initial configuration option authorization_grant_type.`;

    // Default configuration values

    if (!newConfig.well_known_sufix) {
        newConfig.well_known_sufix = ".well-known/openid-configuration";
    }

    for (const option in newConfig) {
        const key = option as keyof IOAuth2Configuration;
        const value = newConfig[key];

        if (!configurationOptions.includes(key))
            throw `Oauth2 oauth2ConfigFactory: unexpected initial configuration option "${key}".`;

        if (key == "authorization_grant_type") {
            if (value == "code") {
                parms.grant_type = "authorization_code";
                parms.response_type ??= [];
                const idx = parms.response_type.indexOf("code");
                idx < 0 && parms.response_type.push("code");
            }
            if (value == "implicit"){
                parms.grant_type = "authorization_code";
                parms.response_type ??= [];
                const idx = parms.response_type.indexOf("code");
                idx >= 0 && parms.response_type.splice(idx, 1);            }
        }

        (newConfig[key] as unknown) = value;
    }

    cfg.configuration = newConfig;

    return cfg;
};

/**
 * Creates an object with the standard parameters received in the initial
 *      configuration object that are appropriate for the indicated
 *      endpoint. If the initial object includes parameters (standard or
 *      custom) for this type of endpoint, it adds them, overwriting the
 *      received standard values ​​if necessary. All values ​​received as
 *      null are removed.
 *
 * @param endpoint Endpoint type
 * @param standardParameters Received standard configuration parameters
 * @param customParameters Received parameters for the endpoint
 * @returns Internal cofiguration object for the endpoint
 */
export const getEndpointParameters = (
    endpoint: keyof typeof endpointParameters,
    config: IOAuth2Config,
): customParametersType => {
    const parameters = config.parameters;
    const customParams = config.configuration[endpoint];
    const standardParms = getStandardParameters(endpoint, parameters);
    const _parms = {...standardParms, ...customParams}
    const parms = Object.fromEntries(
        Object.entries(_parms).filter(
            ([_, value]) => value != null
        )
    );

    return parms as customParametersType
}

/**
 * Returns the parameters defined within the initial configuration object
 *      (standard parameters) that are appropriate for the indicated endpoint
 *      type. Removes null or undefined parameters.
 *
 * @param endpoint Endpoint type
 * @param parameters Received standard configuration parameters
 * @returns Object with the standard parameters
 */
const getStandardParameters = (
    endpoint: keyof typeof endpointParameters,
    parameters: IOAuth2Parameters
) => {
    const names = endpointParameters[endpoint];
    const parms = Object.fromEntries(
        Object.entries(parameters)
        .filter(([key]) => names.includes(key))
    )

    return parms as IOAuth2Parameters;
};

/** Returns true if non-empty trimmed string */
// const isStr = (s: unknown): s is string =>
//     typeof s == "string" && !!s.trim();

/** Returns a non-empty trimmed string or undefined */
// const getStr = (s: string | undefined) =>
//     isStr(s) ? s!.trim() : undefined;

/** Returns true if value type is non-empty string[] */
// const isNonEmptyStringArray = (value: unknown): value is string[] =>
//     Array.isArray(value) &&
//     value.length > 0 &&
//     value.filter(v => typeof v == "string").length == value.length;

/**
 * Converts a non object configuration value and inserts it inside
 *      the internal configuration object
 *
 * @param obj The internal configuration object (altered)
 * @param k The key (name) of the configuration value in obj
 * @param v The initial value
 * @returns void. Inserts the converted value inside the obj parameter
 */
/* const setData = (obj: object, k: string, v: unknown) => {
    const key = k as keyof typeof obj;

    if (typeof v == "boolean") {
        (obj[key] as boolean) = v;
    }

    if (typeof v == "number") {
        (obj[key] as number) = v;
    }

    if (isStr(v)) {
        const val = getStr(v);

        val && ((obj[key] as string) = val);
    }

    if (!Array.isArray(v)) {
        return;
    }

    if (isNonEmptyStringArray(v)) {
        let arr = v.map(v => v.trim());
        arr = arr.filter(v => v != "");

        arr.length && ((obj[key] as string[]) = arr);
    }
}; */

// const setDataObject = (
//     configKey: string,
//     configObject: object,
//     newObject: object
// ) => {
//     Object.entries(configObject).forEach(([key, value]) => {

//         breakLabel: if (
//             configKey == "configuration" &&
//             key.endsWith("_params")
//         ) {
//             const customValue = value as (
//                 | keyof IOAuth2Parameters
//                 | [string, parameterType]
//             )[];
//             const customArray = customValue.filter(
//                 v => typeof v != "string"
//             ) as [string, parameterType][];
//             value = customValue.filter(v => typeof v == "string");

//             if (customArray.length == 0) break breakLabel;

//             const configObject = Object.fromEntries(customArray);
//             const newKey = (key.slice(0, -7) +
//                 "_custom") as keyof oauth2Configuration;
//             ((newObject as oauth2Configuration)[
//                 newKey
//             ] as customParameters) = {};
//             const newObjectData = (newObject as oauth2Configuration)[
//                 newKey
//             ] as customParameters;
//             setDataObject(newKey, configObject, newObjectData);
//         }
//         setData(newObject, key, value);
//     });
// };

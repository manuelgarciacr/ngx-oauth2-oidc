import { IOAuth2Config, IOAuth2Configuration, IOAuth2Parameters, customParameters, oauth2Config, oauth2Configuration, parameterNames, parameterType } from "../domain";
import { debugFn } from "../utils/debugFn";
import { isObject } from "../utils";

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
export const oauth2ConfigFactory = (ioauth2Config: IOAuth2Config) => {
    debugFn("mth", "OAUTH2_CONFIG_FACTORY", ioauth2Config);

    const cfg = <oauth2Config>{}; // Internal configuration object
    // const authorization = ioauth2Config.configuration.authorization ?? {};
    // const token = ioauth2Config.configuration.token ?? {};
    // const authParms = getParams("authorization", ioauth2Config.parameters);
    // const tokenParms = getParams("token", ioauth2Config.parameters);
    // const authCustomParms = <customParameters>{};
    // const tokenCustomParms = <customParameters>{};
    const parameters = ioauth2Config.parameters;

    // Object.entries(ioauth2Config).forEach(([configKey, configData]) => {
    //     if (
    //         typeof configData === "object" &&
    //         !Array.isArray(configData) &&
    //         configData !== null
    //     ) {
    //         // If this configuration value is of type object

    //         (cfg[configKey as keyof oauth2Config] as object) = {};
    //         const newObject = cfg[configKey as keyof oauth2Config] as object;

    //         setDataObject(configKey, configData, newObject);
    //     } else if (typeof configData != "undefined") {
    //         // If this configuration value is not of type object
    //         setData(cfg, configKey, configData);
    //     } // Undefined configuration values are ignored
    // });

    Object.entries(ioauth2Config).forEach(([section, value]) => {

        if (isObject(value) && section == "configuration")
            cfg[section] = convertConfiguration(value, parameters);
        else if (isObject(value) && (section == "metadata" || section == "parameters"))
            cfg[section] = value;
        else
            throw `Oauth2 oauth2ConfigFactory: unexpected initial configuration section ${section}. (invalid name or type)`;
        // Undefined configuration values are ignored
    });

    // for (const parm in authorization) {
    //     const val = authorization[parm];
    //     const key = parm as keyof IOAuth2Parameters;
    //     const idx = authParms.indexOf(key);

    //     if (val == null && idx >= 0) authParms.splice(idx, 1);

    //     if (val != null) authCustomParms[parm] = val;
    // }

    // if (!cfg.configuration)
    //     cfg.configuration = <oauth2Configuration>{};

    // cfg.configuration.authorization_params = authParms;
    // cfg.configuration.authorization_custom = authCustomParms;

    // Default configuration values

    if (cfg.configuration.well_known_sufix == undefined) {
        cfg.configuration.well_known_sufix = ".well-known/openid-configuration";
    }

    cfg.configuration.config = { ...ioauth2Config };

    return cfg;
};

const convertConfiguration = (configuration: IOAuth2Configuration, parameters: IOAuth2Parameters) => {
    const newConfiguration = <oauth2Configuration>{};
    const groups = ["authorization", "token", "refresh", "revocation"];
    const configurationOptions = [
        "tag",
        "authorization_grant_type",
        "no_discovery",
        "well_known_sufix",
        "discovery_endpoint",
        "no_pkce",
    ];

    for (const group of groups) {
        const key = group as keyof typeof parameterNames;
        const newKey = key as keyof oauth2Configuration;
        const value = configuration[key] ?? {};
        const res = groupParameters(key, value, parameters);
        const keys = Object.keys(res) as (keyof oauth2Configuration)[];

        for (const key of keys)
            (newConfiguration[key] as unknown) = res[key];
    }

    Object.entries(configuration).forEach(([key, value]) => {
        const newKey = key as keyof oauth2Configuration;

        if (isObject(value) && groups.includes(key)) {
            null
            // const res = groupParameters(key as keyof typeof parameterNames, value, parameters)
            // const keys = Object.keys(res) as (keyof oauth2Configuration)[];
            // for (const key of keys)
            //     (newConfiguration[key] as unknown) = res[key];
        }
        else if (isObject(value) && key == "id_token_verify") {
            (newConfiguration[newKey] as unknown) = value;
        }
        else if (!isObject(value) && configurationOptions.includes(key))
            (newConfiguration[newKey] as unknown) = value;
        else throw `Oauth2 oauth2ConfigFactory: unexpected initial configuration option ${key}. (invalid name or type)`;
    });

    return newConfiguration
}

const groupParameters = (group: keyof typeof parameterNames, value: customParameters, parameters: IOAuth2Parameters) => {
    const authParms = getParams(group, parameters);
    const authCustomParms = <customParameters>{};
    const res = <{[key: string]: any}>{};

    for (const parm in value) {
        const val = value[parm];
        const key = parm as keyof IOAuth2Parameters;
        const idx = authParms.indexOf(key);

        if (val == null && idx >= 0) authParms.splice(idx, 1);

        if (val != null) authCustomParms[parm] = val;
    }

    res[`${group}_params`] = authParms;
    res[`${group}_custom`] = authCustomParms;

    return res
}

const getParams = (
    type: keyof typeof parameterNames,
    parameters: IOAuth2Parameters
) => {
    const names = parameterNames[type];
    const parms = <(keyof IOAuth2Parameters)[]>[];
debugger
    for (const parm in parameters)
        if (names.includes(parm)) parms.push(parm as keyof IOAuth2Parameters);

    return parms;
};

/** Returns true if non-empty trimmed string */
const isStr = (s: unknown): s is string =>
    typeof s == "string" && !!s.trim();

/** Returns a non-empty trimmed string or undefined */
const getStr = (s: string | undefined) =>
    isStr(s) ? s!.trim() : undefined;

/** Returns true if value type is non-empty string[] */
const isNonEmptyStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.filter(v => typeof v == "string").length == value.length;

/**
 * Converts a non object configuration value and inserts it inside
 *      the internal configuration object
 *
 * @param obj The internal configuration object (altered)
 * @param k The key (name) of the configuration value in obj
 * @param v The initial value
 * @returns void. Inserts the converted value inside the obj parameter
 */
const setData = (obj: object, k: string, v: unknown) => {
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
};

const setDataObject = (
    configKey: string,
    configObject: object,
    newObject: object
) => {
    Object.entries(configObject).forEach(([key, value]) => {

        breakLabel: if (
            configKey == "configuration" &&
            key.endsWith("_params")
        ) {
            const customValue = value as (
                | keyof IOAuth2Parameters
                | [string, parameterType]
            )[];
            const customArray = customValue.filter(
                v => typeof v != "string"
            ) as [string, parameterType][];
            value = customValue.filter(v => typeof v == "string");

            if (customArray.length == 0) break breakLabel;

            const configObject = Object.fromEntries(customArray);
            const newKey = (key.slice(0, -7) +
                "_custom") as keyof oauth2Configuration;
            ((newObject as oauth2Configuration)[
                newKey
            ] as customParameters) = {};
            const newObjectData = (newObject as oauth2Configuration)[
                newKey
            ] as customParameters;
            setDataObject(newKey, configObject, newObjectData);
        }
        setData(newObject, key, value);
    });
};

import {
    IOAuth2Config,
    IOAuth2Configuration,
    configSections,
    metadataNames,
    parameterNames,
} from "../domain";
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
debugger
        if (!isObject(value))
            throw `Oauth2 oauth2ConfigFactory: initial configuration section "${section}" is not an object.`;

        if (!(configSections as string[]).includes(section))
            throw `Oauth2 oauth2ConfigFactory: unexpected initial configuration section "${section}".`;

        cfg[key] = toLowerCaseProperties<any>(value)!;
    }

    // TODO: UNCOMMENT

    // const endpoints = Object.keys(endpointParameters);
    // let names = <string[]>[];
    // for (const endpoint of endpoints) {
    //     const key = endpoint as keyof typeof endpointParameters;
    //     names = [...names, ...endpointParameters[key]];
    // }
    // parameterNames
    // const parmsKeys = Object.keys(ioauth2Config?.parameters ?? {});
    // const parmsErrors = parmsKeys.filter(name => !names.includes(name));

    // if (parmsErrors.length)
    //     console.error(
    //         `WARNING oauth2ConfigFactory: the parameters ${parmsErrors.join(
    //             ", "
    //         )} are not standard. Custom parameters must be included inside the enpoint configuration options`
    //     );

    // const metaKeys = Object.keys(ioauth2Config.metadata);
    // const metaErrors = metaKeys.filter(
    //     name => !metadataNames.includes(name as keyof IOAuth2Metadata)
    // );

    // if (metaErrors.length)
    //     console.error(
    //         `WARNING oauth2ConfigFactory: the metadata ${metaErrors.join(
    //             ", "
    //         )} are not standard. Will be ignored.`
    //     );

    let newConfig = cfg.configuration ?? <IOAuth2Configuration>{};
    const parms = cfg.parameters;

    // Required configuration values

    // if (!authorithationGrantValues.includes(newConfig.authorization_grant_type))
    //     throw `Oauth2 oauth2ConfigFactory: missing initial configuration option authorization_grant_type.`;

    // Default configuration values

    if (!newConfig.well_known_sufix) {
        newConfig.well_known_sufix = ".well-known/openid-configuration";
    }

    // for (const option in newConfig) {
    //     const key = option as keyof IOAuth2Configuration;
    //     const value = newConfig[key];

    //     if (!configurationOptions.includes(key))
    //         throw `Oauth2 oauth2ConfigFactory: unexpected initial configuration option "${key}".`;

    //     if (key == "authorization_grant_type") {
    //         if (value == "code") {
    //             parms.grant_type = "authorization_code";
    //             parms.response_type ??= [];
    //             const idx = parms.response_type.indexOf("code");
    //             idx < 0 && parms.response_type.push("code");
    //         }
    //         if (value == "implicit") {
    //             parms.grant_type = "authorization_code";
    //             parms.response_type ??= [];
    //             const idx = parms.response_type.indexOf("code");
    //             idx >= 0 && parms.response_type.splice(idx, 1);
    //         }
    //     }

    //     (newConfig[key] as unknown) = value;
    // }

    cfg.configuration = newConfig;

    return cfg;
};

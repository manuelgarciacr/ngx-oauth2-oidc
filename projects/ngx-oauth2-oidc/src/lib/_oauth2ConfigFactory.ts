import {
    IOAuth2Config,
    IOAuth2Parameters,
    configSections,
    configurationOptions,
    getType,
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
 * @param ioauth2Config The initial external configuration object
 * @returns The internal configuration object
 */
export const oauth2ConfigFactory = (ioauth2Config = <IOAuth2Config>{}) => {
    debugFn("mth", "OAUTH2_CONFIG_FACTORY", ioauth2Config);

    const cfg = <IOAuth2Config>{}; // Internal configuration object

    ioauth2Config = toLowerCaseProperties(ioauth2Config)!;

    // Configuration sections are objects and not unexpected

    for (const section in ioauth2Config) {
        const key = section as keyof IOAuth2Config;
        const value = ioauth2Config[key];

        if (!isObject(value))
            throw new Error(
                `initial configuration section "${section}" is not an object.`,
                { cause: "oauth2 oauth2ConfigFactory" }
            );

        if (!(configSections as string[]).includes(section))
            throw new Error(
                `unexpected initial configuration section "${section}".`,
                { cause: "oauth2 oauth2ConfigFactory" }
            );

        cfg[key] = toLowerCaseProperties<any>(value)!;
    }

    // Configuration options are not unexpected

    cfg.configuration ??= {};

    const confKeys = Object.keys(cfg.configuration);
    const confErrors = confKeys.filter(
        key => !configurationOptions.includes(key)
    );

    if (confErrors.length)
        throw new Error(
            `Unexpected configuration options and methods: ${confErrors.join(
                ", "
            )}`,
            { cause: "oauth2 oauth2ConfigFactory" }
        );

    // Parameter names are not unexpected

    cfg.parameters ??= {};

    const parmKeys = Object.keys(cfg.parameters);
    const parmErrors = parmKeys.filter(
        key => !parameterNames.all.includes(key)
    );

    if (parmErrors.length)
        // throw new Error(
        //     `Unexpected parameters ${parmErrors.join(
        //         ", "
        //     )}. Custom parameters must be included inside the enpoint configuration options`,
        //     { cause: "oauth2 oauth2ConfigFactory" }
        // );
        console.error(
            `WATNING: Unexpected parameters ${parmErrors.join(
                ", "
            )}. Custom parameters must be included inside the enpoint configuration options`
        );

    // Metadate names are not unexpected

    cfg.metadata ??= {};

    const metaKeys = Object.keys(cfg.metadata);
    const metaErrors = metaKeys.filter(name => !metadataNames.includes(name));

    if (metaErrors.length)
        throw new Error(
            `Unexpected metadata ${metaErrors.join(", ")}.`,
            { cause: "oauth2 oauth2ConfigFactory" }
        );

    // Default configuration values

    if (!cfg.configuration.well_known_sufix) {
        cfg.configuration.well_known_sufix = ".well-known/openid-configuration";
    }

    // Parameters types

    for (const parm in cfg.parameters) {
        const key = parm as keyof IOAuth2Parameters;
        const value = cfg.parameters[key];
        const type = getType(key);

        if (type == "array" && !Array.isArray(value)) {
            throw new Error(`The parameter "${key}" must be an array`, {
                cause: "oauth2 oauth2ConfigFactory",
            });
        }

        if (
            type == "json" &&
            !isJSON(value)
        ) {
            throw new Error(`The parameter "${key}" must be of type JSON`, {
                cause: "oauth2 oauth2ConfigFactory",
            });
        }

        if (
            type != "array" &&
            type != "json" &&
            type != "undefined" &&
            type != typeof value
        ) {
            throw new Error(
                `The parameter "${key}" must be of type ${type}`,
                {
                    cause: "oauth2 oauth2ConfigFactory",
                }
            );
        }
    }

    return cfg;
};

const isJSON = (v: unknown) => {
    try {
        return !!v && typeof v == "string" && !!JSON.parse(v)
    } catch {
        return false
    }
}

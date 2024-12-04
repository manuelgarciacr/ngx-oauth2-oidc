import {
    IOAuth2Config,
    configSections,
    configurationOptions,
    customParametersType,
    metadataNames,
} from "../domain";
import { isObject, toLowerCaseProperties } from "../utils";
import { _setParameters } from "./_setParameters";

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
export const _oauth2ConfigFactory = (ioauth2Config = <IOAuth2Config>{}) => {
    if (!ioauth2Config || Object.entries(ioauth2Config).length == 0)
        return {};

    const cfg = <IOAuth2Config>{}; // Internal configuration object

    ioauth2Config = toLowerCaseProperties(ioauth2Config)!;

    // Configuration sections are objects and not unexpected

    for (const section in ioauth2Config) {
        const key = section as keyof IOAuth2Config;
        const value = ioauth2Config[key];

        if (!isObject(value))
            throw new Error(
                `Initial configuration section "${section}" is not an object.`,
                { cause: "oauth2 oauth2ConfigFactory" }
            );

        if (!(configSections as string[]).includes(section))
            throw new Error(
                `Unexpected initial configuration section "${section}".`,
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
            `Unexpected configuration options: ${confErrors.join(
                ", "
            )}`,
            { cause: "oauth2 oauth2ConfigFactory" }
        );

    cfg.parameters = _setParameters(cfg.parameters as customParametersType, "oauth2ConfigFactory");
    cfg.parameters.redirect_uri ??= window.location.href
        .split("#")[0]
        .split("?")[0];

    cfg.metadata ??= {};

    const metaKeys = Object.keys(cfg.metadata);
    const metaErrors = metaKeys.filter(name => !metadataNames.includes(name));

    if (metaErrors.length)
        console.error(
            `WARNING: Unexpected metadata fields ${metaErrors.join(", ")}.`,
            { cause: "oauth2 oauth2ConfigFactory" }
        );

    return cfg;
};

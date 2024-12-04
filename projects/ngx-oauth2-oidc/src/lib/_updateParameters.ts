import { IOAuth2Config, IOAuth2Parameters, customParametersType, getType } from "../domain";
import { setStore } from "./_store";

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
export const updateParameters = (
    obj: { [key: string]: string },
    config: IOAuth2Config // Passed by reference and updated (configuration.parameters)
) => {
    const storage = config.configuration?.storage;
    const newObj = <customParametersType>{}; //<IOAuth2Parameters>{};

    // TODO: test number and boolean conversion
    for (const key in obj) {
        const newKey = key as keyof IOAuth2Parameters;
        const value = obj[key];
        const type = getType(newKey);
        const newValue =
            type == "array"
                ? value.split(" ")
                : type == "number"
                ? (JSON.parse(value) as number)
                : type == "boolean"
                ? (JSON.parse(value) as boolean)
                : value;

        (newObj[key] as unknown) = newValue;
    }

    if (newObj["expires_in"]) {
        newObj["expires_in"] =
            new Date().getTime() + (newObj["expires_in"] as number) * 1000;
    }

    config.parameters = {
        ...config.parameters,
        ...newObj,
    };

    setStore(
        "config",
        storage
            ? config
            : null
    );

    return newObj as IOAuth2Parameters;
};

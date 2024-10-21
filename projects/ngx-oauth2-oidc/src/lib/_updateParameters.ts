import { IOAuth2Config, IOAuth2Parameters, customParametersType, getType } from "../domain";
import { setStore } from "./_store";

// TODO: no-storage configuration option

/**
 * Converts an object of string type parameters to an IOAuth2Parameters object
 *   and saves the new configuration parameters.
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @returns An IOAuth2Parameters object
 */
export const updateParameters = (
    obj: { [key: string]: string },
    config: IOAuth2Config // Passed by reference uand pdated (config.parameters)
) => {
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

    config.parameters = {
        ...config.parameters,
        ...newObj,
    };

    // TODO: no-storage configuration option
    setStore("config", config);

    return newObj as IOAuth2Parameters;
};

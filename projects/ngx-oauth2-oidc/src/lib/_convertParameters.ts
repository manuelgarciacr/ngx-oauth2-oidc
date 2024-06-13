import { IOAuth2Config, IOAuth2Parameters, customParametersType, getType } from "../domain";
import { setStore } from "./_store";

/**
 * Converts an object of string type parameters to an IOAuth2Parameters object
 *      and saves the new configuration parameters.
 *
 * @param obj The object of string type parameters
 * @returns An IOAuth2Parameters object
 */
export const convertParameters = (obj: {[key: string]: string}, config: IOAuth2Config) => {

    const newObj = <customParametersType>{};//<IOAuth2Parameters>{};

    // TODO: test number and boolean conversion
    for (const key in obj) {
        const newKey = key as keyof IOAuth2Parameters;
        const value = obj[key];
        // const isArray = string_array_parameter.find(v => v == key);
        // const isNumber = number_parameter.find(v => v == key);
        // const isUrl = url_parameter.find(v => v == key);
        const type = getType(newKey);
        const newValue =
            type == "array"
                ? value.split(" ")
                : type == "number"
                ? (JSON.parse(value) as number)
                : type == "boolean"
                ? (JSON.parse(value) as boolean)
                : value;

        // const newKey = key as keyof IOAuth2Parameters;
        // The code is not saved in the sessionStorage, but in the
        //      internal configuration of the service.
        /*if (key != "code")*/ (newObj[key] as unknown) = newValue;
    }

    config.parameters = {
        ...config.parameters,
        ...newObj,
    };

    setStore("config", config);

    return newObj as IOAuth2Parameters
}

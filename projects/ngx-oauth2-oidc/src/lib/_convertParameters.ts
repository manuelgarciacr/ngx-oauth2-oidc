import { IOAuth2Config, IOAuth2Parameters, customParametersType, number_parameter, string_array_parameter, url_parameter } from "../domain";
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
        const value = obj[key];
        const isArray = string_array_parameter.find(v => v == key);
        const isNumber = number_parameter.find(v => v == key);
        const isUrl = url_parameter.find(v => v == key);
        const newValue = isArray
            ? value.split(" ")
            : isNumber
            ? (JSON.parse(value) as number)
            : isUrl
            ? value
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

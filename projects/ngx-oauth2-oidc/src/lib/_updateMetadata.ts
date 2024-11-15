import { IOAuth2Config, IOAuth2Metadata } from "../domain";
import { setStore } from "./_store";

/**
 * Gets an object of string type parameters and saves the new configuration metadata.
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @returns An IOAuth2Parameters object
 */
export const updateMetadata = (
    obj: { [key: string]: string },
    config: IOAuth2Config // Passed by reference and updated (configuration.metadata)
) => {

    config.metadata = {
        ...config.metadata,
        ...obj,
    };

    // TODO: no-storage configuration option
    setStore("config", config);

    return obj as IOAuth2Metadata;
};

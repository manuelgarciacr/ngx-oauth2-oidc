import { IOAuth2Config, IOAuth2Parameters } from "../domain";
import { updateParameters } from "./_updateParameters";

export const _interceptor = (config: IOAuth2Config | null) => {
    const search = decodeURIComponent(window.location.search);
    const hash = decodeURIComponent(window.location.hash);
    const str = search.length ? search : hash;
    const substr = str.substring(1);
    const array = substr.length ? substr.split("&") : [];
    const entries = array.map(v => v.split("="));
    const params = Object.fromEntries(entries);

    if (!entries.length)
        return Promise.resolve({} as IOAuth2Parameters);

    if (!config)
        return Promise.reject(
            new Error(
                `no configuration defined.`,
                {
                    cause: "oauth2 interceptor",
                }
            )
        );

    const state = config.parameters?.state;

    if (state && state != params["state"])
        return Promise.reject(
            new Error(
                `ilegal state received.`,
                {
                    cause: "oauth2 interceptor",
                }
            )
        );

    const newParams = updateParameters(params, config);

    if (newParams["error"])
        return Promise.reject(
            new Error(
                `${newParams["error"]} ${newParams["error_description"] ?? ""}`,
                {
                    cause: "oauth2 interceptor",
                }
            )
        );

    return Promise.resolve(newParams);
};

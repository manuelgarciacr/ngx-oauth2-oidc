import { IOAuth2Config, IOAuth2Parameters } from "../domain";
import { updateParameters } from "./_updateParameters";

export const _interceptor = (
    config: IOAuth2Config | null,
) => {
    const search = decodeURIComponent(window.location.search);
    const hash = decodeURIComponent(window.location.hash);
    const str = hash.length ? hash : search;
    const substr = str.substring(1);
    const array = substr.length ? substr.split("&") : [];
    const entries = array.map(v => v.split("="));
    const params = Object.fromEntries(entries);
    const parmsState = config?.parameters?.state;

    window.history.replaceState({}, "", window.location.pathname);

    if (!entries.length) return Promise.resolve({} as IOAuth2Parameters);

    if (!config)
        return Promise.reject(
            new Error(`No configuration defined.`, {
                cause: "oauth2 interceptor",
            })
        );

    if (parmsState && parmsState !== params["state"])
        return Promise.reject(
            new Error(`Ilegal state received.`, {
                cause: "oauth2 interceptor",
            })
        );

    const newParams = updateParameters(params, config);

    if (newParams["error"])
        return Promise.reject(
            new Error(
                `${JSON.stringify(newParams, null, 4)}`,
                {
                    cause: "oauth2 interceptor",
                }
            )
        );

    return Promise.resolve(newParams);
};

import { IOAuth2Config, IOAuth2Parameters, jsonObject } from "../domain";
import { _oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { _recover_state } from "./_recoverState";
import { updateParameters } from "./_updateParameters";

export const _interceptor = async (
    config: IOAuth2Config, // Parameter passed by reference and updated (oauth2Service.config)
    idToken: jsonObject // Parameter passed by reference and updated (oauth2Service.idToken)
) => {

    await _recover_state(config, idToken);

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

    if (parmsState && parmsState !== params["state"])
        return Promise.reject(
            new Error(`Ilegal state received.`, {
                cause: "oauth2 interceptor",
            })
        );

    const newParams = updateParameters(params, config);

    if (newParams["error"])
        return Promise.reject(
            new Error(`${JSON.stringify(newParams, null, 4)}`, {
                cause: "oauth2 interceptor",
            })
        );

    return Promise.resolve(newParams);
};

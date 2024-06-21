import { IOAuth2Config } from "../domain";
import { convertParameters } from "./_convertParameters";

export const _interceptor = (config: IOAuth2Config | null) => {
    const search = decodeURIComponent(window.location.search);
    const hash = decodeURIComponent(window.location.hash);
    const str = search.length ? search : hash;
    const substr = str.substring(1);
    const array = substr.length ? substr.split("&") : [];
    const entries = array.map(v => v.split("="));
    // const searchParams = searchArr2.reduce((obj, v) => {
    //     const idx = v[0];
    //     obj[idx] = v[1];
    //     return obj;
    // }, {} as { [key: string]: string });
    const params = Object.fromEntries(entries);
    // const hashStr = hash.substring(1);
    // const hashArr = hashStr.length ? hashStr.split("&") : [];
    // const hashArr2 = hashArr.map(v => v.split("="));
    // const params = hashArr2.reduce((obj, v) => {
    //     const idx = v[0];
    //     obj[idx] = v[1];
    //     return obj;
    // }, searchParams);

    if (!config) throw "oauth2 interceptor: no configuration defined";

    const state = config.parameters?.state;

    if (state && state != params["state"])
        return Promise.reject("oauth2 interceptor: Ilegal state received");

    const newParams = convertParameters(params, config);

    if (newParams["error"])
        return Promise.reject(
            `oauth2 interceptor: ${newParams["error"]} ${
                newParams["error_description"] ?? ""
            }`
        );

    return Promise.resolve(newParams);
};

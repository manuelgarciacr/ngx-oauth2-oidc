import { IOAuth2Config } from "../domain";

/**
 * Sets/removes an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @param value New value. If null or empty string, the item is removed.
 */
export const setStore = (
    name: string,
    value: unknown = null
) => {
    const sto = sessionStorage;

    const val = JSON.parse(JSON.stringify(value));

    if (name == "config" && !!value) {
        delete (val as IOAuth2Config)?.parameters?.id_token;
        delete (val as IOAuth2Config)?.parameters?.access_token;
        delete (val as IOAuth2Config)?.parameters?.refresh_token;
        delete (val as IOAuth2Config)?.parameters?.code;
        delete (val as IOAuth2Config)?.parameters?.client_secret;
        delete (val as IOAuth2Config)?.parameters?.code_challenge;
    }

    name = `oauth2_${name}`;
    if (val == null || val === "") sto.removeItem(name);
    else sto.setItem(name, JSON.stringify(val))
};

/**
 * Gets an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
export const getStore = (
    name: string
): string | null => {
    const sto = sessionStorage;

    name = `oauth2_${name}`;
    return sto.getItem(name);
};

/**
 * Gets an oauth2 session storage item as an object type
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
export const getStoreObject = (
    name: string
): object | null => {
    const str = getStore(name);

    return str ? (JSON.parse(str) as object) : null;
};

import { debugFn } from "../utils";

/**
 * Sets/removes an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @param val New value. If null or empty string, the item is removed.
 */
export const setStore = (name: string, val: unknown = null) => {
    debugFn("prv", "SET_STORE", name);

    const sto = sessionStorage;

    name = `oauth2_${name}`;
    if (val == null || val === "") sto.removeItem(name);
    else sto.setItem(name, JSON.stringify(val));
};

/**
 * Gets an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
export const getStore = (name: string): string | null => {
    debugFn("prv", "GET_STORE", name);

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
export const getStoreObject = (name: string): object | null => {
    const str = getStore(name);

    return str ? (JSON.parse(str) as object) : null;
}

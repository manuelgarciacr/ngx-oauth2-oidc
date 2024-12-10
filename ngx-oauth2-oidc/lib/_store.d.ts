/**
 * Sets/removes an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @param value New value. If null or empty string, the item is removed.
 */
export declare const setStore: (name: string, value?: unknown) => void;
/**
 * Gets an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
export declare const getStore: (name: string) => string | null;
/**
 * Gets an oauth2 session storage item as an object type
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
export declare const getStoreObject: (name: string) => object | null;
//# sourceMappingURL=_store.d.ts.map
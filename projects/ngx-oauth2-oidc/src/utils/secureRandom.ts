/**
 * Returns an (16 x length) hex characters random string
 * @param length Length in groups of 16 hex characters. Defaults to 1
 * @returns
 */
export const secureRandom = (length = 1) => {
    const array = new BigUint64Array(length);

    window.crypto.getRandomValues(array);

    const str = array.reduce((p, v) => `${p}${v.toString(16)}`, "")

    return str;
};

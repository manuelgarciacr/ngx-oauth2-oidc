/**
 * Returns an 16 bytes hexadecimal random string
 * @returns
 */
export const secureRandom = () => {
    const array = new BigUint64Array(1);

    window.crypto.getRandomValues(array);
    return array[0].toString(16);
};

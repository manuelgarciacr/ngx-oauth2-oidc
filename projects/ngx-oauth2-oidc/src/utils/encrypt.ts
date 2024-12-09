export const encrypt = (
    text: string
): Promise<[CryptoKey, ArrayBuffer, ArrayBuffer]> =>
    window.crypto.subtle
        .generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        )
        .then(async key => {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const cipher = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv,
                },
                key,
                new TextEncoder().encode(text)
            );
            return [key, iv, cipher];
        });

export const decrypt = (
    key: CryptoKey,
    iv: ArrayBuffer,
    cipher: ArrayBuffer
) =>
    window.crypto.subtle
        .decrypt(
            {
                name: "AES-GCM",
                iv
            },
            key,
            cipher
        )
        .then (arrayBuffer => new TextDecoder("UTF-8").decode(arrayBuffer));

export const arrayBufferToHexString = (arrayBuffer: ArrayBuffer) => {
    const uint8Array = new Uint8Array(arrayBuffer);
    const string = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    return string
}

export const hexStringToArrayBuffer = (string: string) => {
    const matchArray = string.match(/[\da-f]{2}/gi);

    if (!matchArray)
        return new ArrayBuffer(0);

    const uint8Array = new Uint8Array(
        matchArray.map(function (h) {
            return parseInt(h, 16);
        })
    );

    return uint8Array.buffer
}

export const getCookie = (name: string) => {
    let start = document.cookie.indexOf(`${name}=`);

    if (start < 0)
        return "";

    start += (name.length + 1);
    const end = document.cookie.indexOf(";", start);
    const value = document.cookie.substring(
        start,
        end >= 0 ? end : undefined
    );

    return value
}

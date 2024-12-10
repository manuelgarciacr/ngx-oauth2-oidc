export declare const encrypt: (text: string) => Promise<[CryptoKey, ArrayBuffer, ArrayBuffer]>;
export declare const decrypt: (key: CryptoKey, iv: ArrayBuffer, cipher: ArrayBuffer) => Promise<string>;
export declare const arrayBufferToHexString: (arrayBuffer: ArrayBuffer) => string;
export declare const hexStringToArrayBuffer: (string: string) => ArrayBufferLike;
export declare const getCookie: (name: string) => string;
//# sourceMappingURL=encrypt.d.ts.map
import { IOAuth2Config, jsonObject } from "../domain";
import { arrayBufferToHexString, encrypt } from "../utils/encrypt";

export const _save_state = async (
    config: IOAuth2Config,
    idToken: jsonObject
) => {
    const text = JSON.stringify({config, idToken});
    const [key, iv, cipher] = await encrypt(text);
    const keyRaw = await window.crypto.subtle.exportKey("raw", key);
    const keyString = arrayBufferToHexString(keyRaw);
    const cipherString = arrayBufferToHexString(cipher);
    const ivString = arrayBufferToHexString(iv);

    document.cookie = `ngx_oauth2_oidc=${keyString}${ivString}; secure; samesite=strict`;
    sessionStorage.setItem("oauth2_unload", cipherString);
};

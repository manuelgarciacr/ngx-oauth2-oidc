import { IOAuth2Config, jsonObject } from "../domain";
import { decrypt, getCookie, hexStringToArrayBuffer } from "../utils/encrypt";
import { _oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { setStore } from "./_store";

export const _recover_state = async (
    config: IOAuth2Config, // Parameter passed by reference and updated (oauth2Service.config)
    idToken: jsonObject // Parameter passed by reference and updated (oauth2Service.idToken)
) => {
    const cookieValue = getCookie("ngx_oauth2_oidc");
    const hexString = sessionStorage.getItem("oauth2_unload");

    sessionStorage.removeItem("oauth2_unload");
    document.cookie = "ngx_oauth2_oidc=; max-age=0";

    //  The configuration is only restored if it was previously saved and if the current
    //      configuration is empty
    if (
        !Object.entries(config).length &&
        cookieValue.length == 88 &&
        hexString?.length
    ) {
        const keyValue = cookieValue.substring(0, 64);
        const ivValue = cookieValue.substring(64);
        const keyBuffer = hexStringToArrayBuffer(keyValue);
        const ivBuffer = hexStringToArrayBuffer(ivValue);
        const hexData = hexStringToArrayBuffer(hexString ?? "");
        const importedKey = await window.crypto.subtle.importKey(
            "raw",
            keyBuffer,
            "AES-GCM",
            false,
            ["decrypt"]
        );
        const data = await decrypt(importedKey, ivBuffer, hexData);
        const parsed = JSON.parse(data);
        const newConfig = parsed.config ?? config ?? {};
        const newIdToken = parsed.idToken ?? idToken ?? {};

        Object.assign(config, _oauth2ConfigFactory(newConfig)); // Parameter passed by reference and updated
        Object.assign(idToken, newIdToken);

        const storage = config.configuration?.storage;

        setStore("config", storage ? config : null);
        setStore("idToken", storage ? idToken : null);
        setStore("test");
    }
}

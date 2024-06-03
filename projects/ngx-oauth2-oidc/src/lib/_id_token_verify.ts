import { createRemoteJWKSet, jwtVerify } from "jose";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Parameters, customParameters } from "../domain";
import { setStore } from "./_store";

export const _id_token_verify = async (config: IOAuth2Config | null, userProfile: object | null, token?: string, options?: customParameters) => {
    const jwksUri = config?.metadata.jwks_uri;
    const _token = config?.parameters.id_token ?? token;
    const _options = config?.configuration.id_token_verify ?? options;
    const isData = (s: string) => {
        if (s.startsWith("##")) {
            const key = s.substring(2) as keyof IOAuth2Parameters;
            return config?.parameters[key];
        }
        if (s.startsWith("#")) {
            const key = s.substring(2) as keyof IOAuth2Metadata;
            return config?.metadata[key];
        }
        return s;
    };

    if (!config) throw "oauth2 token_id_verify: no configuration defined";

    if (!jwksUri) throw "oauth2 token_id_verify: no jwks_uri defined";

    if (!_token) throw "oauth2 token_id_verify: no id_token defined";

    for (const key in _options) {
        const v = _options[key];
        if (typeof v == "string") {
            (_options[key] as unknown) = isData(v);
        }
    }

    const JWKS = createRemoteJWKSet(new URL(jwksUri));

    const { payload } = await jwtVerify(_token, JWKS, _options);
    userProfile = payload;
    setStore("userProfile", payload);

    return Promise.resolve(payload);
};

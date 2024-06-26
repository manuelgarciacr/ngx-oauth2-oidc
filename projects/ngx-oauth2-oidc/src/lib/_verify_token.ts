import { createRemoteJWKSet, jwtVerify } from "jose";
import { IOAuth2Config, customParametersType } from "../domain";
import { setStore } from "./_store";
import { initConfig } from "./_initConfig";
import { getParameters } from "./_getParameters";

export const _verify_token = async (
    ioauth2Config: IOAuth2Config | null,
    userProfile: object | null,
    options = <customParametersType>{},
) => {
    const config = initConfig(ioauth2Config);
    const parms = getParameters("verify_token", config);
    const meta = config.metadata!;
    const str = (name: string) =>
        (options[name] as string) ?? parms[name] ?? "";
    const id_token = str("id_token");

    if (!id_token) throw new Error(
        "Values ​​for parameter 'id_token' and option 'id_token' are missing.",
        {
            cause: "oauth2 verify_token",
        }
    );

    const jwks_uri =
        (options["jwks_uri"] as string) ??
        meta?.jwks_uri ??
        "";

    if (!jwks_uri)
        throw new Error(
            `Values ​​for 'jwks_uri' metadata, and 'jwks_uri' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

    const issuer =
        (options["issuer"] as string) ??
        meta?.issuer ??
        "";

    if (!issuer)
        throw new Error(
            `Values ​​for 'issuer' metadata, and 'issuer' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

    const audience =
        (options["audience"] as string | string[]) ??
        (options["client_id"] as string) ??
        parms?.["client_id"] ??
        "";

    if (!audience)
        throw new Error(
            `The values ​​for the 'client_id' parameter, 'client_id' option, and 'audience' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

    const nonce = str("nonce");

    // if (!nonce)
    //     throw new Error(
    //         `The values ​​for the 'nonce' parameter and 'nonce' option are missing.`,
    //         { cause: "oauth2 verify_token" }
    //     );

    options = {...options, issuer, audience, nonce}
    delete options["id_token"];

    const JWKS = createRemoteJWKSet(new URL(jwks_uri));

    const { payload } = await jwtVerify(id_token, JWKS, options);

    if (payload["nonce"] != nonce)
        throw new Error('unexpected "nonce" claim value', { cause: "JWTClaimValidationFailed" });

    userProfile = payload;
    setStore("userProfile", payload);

    return Promise.resolve(payload);
};

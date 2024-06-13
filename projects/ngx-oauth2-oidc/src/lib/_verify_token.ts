import { createRemoteJWKSet, jwtVerify } from "jose";
import { IOAuth2Config, customParametersType } from "../domain";
import { setStore } from "./_store";
import { initConfig } from "./_initConfig";

export const _verify_token = async (
    ioauth2Config: IOAuth2Config | null,
    userProfile: object | null,
    options = <customParametersType>{},
) => {
    const config = initConfig(ioauth2Config);
    const cfg = config.configuration!;
    const parms = cfg.verify_token ?? {};
    // TODO: eliminate string[] and type verify
    const parameters = config.parameters!;
    const meta = config.metadata!;

    const id_token = (
        options["id_token"] ??
        parms["id_token"] ??
        parameters["id_token"] ??
        ""
    ) as string;

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
        (options["id_token_verification_audience"] as string | string[]) ??
        (options["client_id"] as string) ??
        parms?.["client_id"] ??
        "";

    if (!audience)
        throw new Error(
            `The values ​​for the 'client_id' parameter, 'client_id' option, and 'id_token_verification_audience' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

    const nonce =
        options["nonce"] ??
        parms?.["nonce"] ??
        "";

    if (!nonce)
        throw new Error(
            `The values ​​for the 'nonce' parameter and 'nonce' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

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

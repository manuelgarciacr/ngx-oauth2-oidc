import { createRemoteJWKSet, jwtVerify } from "jose";
import { IOAuth2Config, customParametersType } from "../domain";
import { setStore } from "./_store";
import { getParameters } from "./_getParameters";

/**
 * Verification of the id_token saved in the configuration. Makes use of the 'jose' library.
 *   Needs the jwks_uri metadata (see jose library) and the issuer. You also need the parameters.
 *   id_token, client_id, audience (client_id) and nonce. This data can be overwritten by the
 *   options parameter data. Returns the payload of the id_token and saves it to storage and
 *   memory. In test mode, the request payload is also stored inside sessionStorage.
 *
 * @param config Configuration object saved in memory.
 * @param userProfile id_token payload saved in memory. Passed by reference and
 *      updated
 * @param options Custom parameters for the request.
 * @returns The Promise with the id_token payload or error
 */
export const _verify_token = async (
    config: IOAuth2Config,
    userProfile: object | null, // Passed by reference and updated
    options = <customParametersType>{}
) => {
    const meta = config.metadata ?? {};
    const parms = getParameters("verify_token", config);
    const str = (name: string) =>
        (options[name] as string) ?? parms[name] ?? "";

    // TODO: no-storage configuration option
    setStore("test", {});

    const id_token = str("id_token");

    if (!id_token)
        throw new Error(
            "Values ​​for parameter 'id_token' and option 'id_token' are missing.",
            {
                cause: "oauth2 verify_token",
            }
        );

    const jwks_uri = (options["jwks_uri"] as string) ?? meta?.jwks_uri ?? "";

    if (!jwks_uri)
        throw new Error(
            `Values ​​for 'jwks_uri' metadata, and 'jwks_uri' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

    const issuer = (options["issuer"] as string) ?? meta?.issuer ?? "";

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

    options = { ...options, issuer, audience, nonce };
    delete options["id_token"];

    const JWKS = createRemoteJWKSet(new URL(jwks_uri));

    // Token payload
    const { payload } = await jwtVerify(id_token, JWKS, options);

    if (payload["nonce"] && payload["nonce"] != nonce)
        throw new Error('unexpected "nonce" claim value', {
            cause: "JWTClaimValidationFailed",
        });

    userProfile = payload;
    setStore("userProfile", payload);

    const test = config.configuration?.test;

    const paramsObj = test
        ? ({ id_token, jwks_uri, issuer, audience, nonce, ...options } as {
              [key: string]: any;
          })
        : {};

    if (test) {
        setStore("test", paramsObj);
    }

    return Promise.resolve(payload);
};

import { createRemoteJWKSet, JWTPayload, jwtVerify } from "jose";
import { IOAuth2Config, customParametersType } from "../domain";
import { setStore } from "./_store";
import { getParameters } from "./_getParameters";
import { _setParameters } from "./_setParameters";

/**
 * Verification of the id_token saved in the configuration. Makes use of the 'jose' library.
 *   Needs the "jwks_uri" and "issuer" metadata (see jose library). You also need the parameters.
 *   id_token, client_id, audience (or client_id) and nonce. This data can be overwritten by the
 *   options parameter data. Returns the payload of the id_token and saves it to storage and
 *   memory. In test mode, the request payload is also stored inside sessionStorage.
 *
 * @param config Configuration object saved in memory.
 * @param idToken id_token payload saved in memory. Passed by reference and updated
 * @param customParameters Custom parameters for the request. May include values ​​to override 'jwks_uri'
 *      and 'issuer' metadata.
 * @param issuer Authorization server's issuer identifier URL
 * @param jwks_uri URL of the authorization server's JWK Set document
 * @returns The Promise with the id_token payload or error
 */
export const _verify_token = async (
    config: IOAuth2Config,
    customParameters = <customParametersType>{},
    _issuer?: string,
    _jwks_uri?: string
) => {
    // Configuration options
    const test = config.configuration?.test;
    // Metadata fields
    const issuer = _issuer ?? config.metadata?.issuer ?? "";
    const jwks_uri = _jwks_uri ?? config.metadata?.jwks_uri ?? "";
    // Endpoint parameters
    const str = (name: string) =>
        (customParameters[name] as string) ?? parms[name] ?? "";
    const parms = _setParameters({
        ...getParameters("verify_token", config),
        ...customParameters,
    });
    const id_token = str("id_token");
    const nonce = str("nonce");

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    if (!id_token) return;

    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //

    if (!jwks_uri)
        throw new Error(`Value ​​for 'jwks_uri' metadata is missing.`, {
            cause: "oauth2 verify_token",
        });

    if (!issuer)
        throw new Error(`Value ​​for 'issuer' metadata is missing.`, {
            cause: "oauth2 verify_token",
        });

    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //

    // AUDIENCE

    const audience =
        (parms["audience"] as string | string[]) ?? parms["client_id"] ?? "";

    if (!audience)
        throw new Error(
            `The values ​​for the 'client_id' parameter, 'client_id' option, and 'audience' option are missing.`,
            { cause: "oauth2 verify_token" }
        );

    // JVTVERIFYOPTIONS

    Object.assign(parms, { nonce, issuer, audience, jwks_uri });

    const JWKS = createRemoteJWKSet(new URL(jwks_uri));
    const jvtVerifyOptions = { ...parms } as customParametersType;

    delete jvtVerifyOptions["id_token"];
    delete jvtVerifyOptions["jwks_uri"];
    delete jvtVerifyOptions["client_id"];

    // PAYLOAD

    let payload: JWTPayload = {};
    try {
        const { payload: readPayload } = await jwtVerify(
            id_token,
            JWKS,
            jvtVerifyOptions
        );
        payload = readPayload;
    } catch (err) {
        const error = new Error((err as Error).message, {
            cause: "oauth2 verify_token",
        });
        error.name = (err as Error).name;
        throw error;
    }

    if (payload["nonce"] && payload["nonce"] != nonce) {
        const error = Error('unexpected "nonce" claim value', {
            cause: "oauth2 verify_token",
        });
        error.name = "JWTClaimValidationFailed";
        throw error;
    }

    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////

    if (test) {
        // TODO: no-storage configuration option
        setStore("test", parms);
    }

    return Promise.resolve(payload);
};

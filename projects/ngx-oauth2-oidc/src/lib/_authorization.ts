import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { IOAuth2Config, IOAuth2Parameters, customParametersType, payloadType } from "../domain";
import { isStrNull, notStrNull, secureRandom } from "../utils";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { _setParameters } from "./_setParameters";

// TODO: no-storage configuration option

/**
 * Request to then OAuth2 authorization endpoint. Redirects to the endpoint.
 *   The interceptor function inside the onInit method gets the response and actualizes
 *   the config.parameters. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param httpH ttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param statePayload Payload to add to state parameter
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _authorization = async (
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and updated (configuration.parameters)
    customParameters = <customParametersType>{},
    statePayload?: string,
    url?: string
): Promise<IOAuth2Parameters> => {
    // Configuration options
    const test = config.configuration?.test;
    const no_pkce = !!config.configuration?.no_pkce;
    const no_state = !!config.configuration?.no_state;
    // TODO: authorization_grant 'hybrid' and 'free'
    const grant = config.configuration?.authorization_grant ?? "code";
    const basicGrant = ["code", "implicit", "hybrid"].includes(grant);
    // Metadata fields
    const authorization_endpoint = config.metadata?.authorization_endpoint;
    // url
    url ??= authorization_endpoint ?? "";
    // Endpoint parameters
    const arr = (name: string) =>
        (<string[]>parms[name] ?? []).map(str => str.toLowerCase());
    const parms = _setParameters({
        ...getParameters("authorization", config),
        ...{ state: null, nonce: null }, // This parameters must be created or as custom parameters
        ...customParameters,
    });
    const scope = arr("scope");
    const response_type = arr("response_type");
    const code_verifier =
        (parms["code_verifier"] as string) ??
        config.token?.["code_verifier"] ??
        config.parameters?.code_verifier ??
        "";
    const code_challenge_method = parms["code_challenge_method"] as
        | "S256"
        | "plain"
        | undefined;
    const code_challenge = parms["code_challenge"] as string | undefined;
    const pkce = { code_challenge, code_challenge_method, code_verifier };
    const readState = parms["state"] as string | undefined;
    const state = {
        state: statePayload ? readState + statePayload : readState,
    };
    const nonce = { nonce: parms["nonce"] as string | undefined };

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //

    if (!url)
        throw new Error(
            `The value of the 'authorization_endpoint' metadata field or the 'url' option is missing.`,
            {
                cause: `oauth2 authorization`,
            }
        );

    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //

    // SCOPE (must be processed before response_type)

    if (!scope.length) {
        scope.push("openid", "email", "profile");
    }

    // RESPONSE_TYPE (must be processed before nonce)

    if (basicGrant || response_type.length > 1) {
        const noneIdx = response_type.indexOf("none");

        if (noneIdx >= 0) response_type.splice(noneIdx, 1);
    }

    if (grant == "code") {
        response_type.splice(0, 10, "code");
    }

    if (grant == "implicit") {
        // scope is not empty
        const userScopes = ["openid", "email", "profile"];
        const hasUserScope = scope.some(str => userScopes.includes(str));
        const hasApiScope = scope.some(str => !userScopes.includes(str));
        const codeIdx = response_type.indexOf("code");
        const tokenIdx = response_type.indexOf("token");
        const idTokenIdx = response_type.indexOf("id_token");

        codeIdx >= 0 && response_type.splice(codeIdx, 1);

        hasUserScope &&
            idTokenIdx < 0 &&
            tokenIdx < 0 &&
            response_type.push("id_token");

        hasApiScope && tokenIdx < 0 && response_type.push("token");
    }

    // PKCE

    // TODO: https://engineering.99x.io/demystifying-spa-security-with-pkce-fb55af7d3f5

    for (const prop in pkce) delete (pkce as payloadType)[prop];

    if (no_pkce || grant != "code") {
        delete parms["code_challenge"];
        delete parms["code_challenge_method"];
        delete parms["code_verifier"];
    } else {
        Object.assign(pkce, await getPkce(parms, code_verifier as string));
    }

    // STATE

    for (const prop in state) delete (state as payloadType)[prop];

    if (no_state) {
        delete parms["state"];
    } else {
        Object.assign(state, {
            state: notStrNull(parms["state"], secureRandom(2)) + statePayload,
        });
    }

    // NONCE

    const idTokenIdx = response_type.indexOf("id_token");

    for (const prop in nonce) delete (nonce as payloadType)[prop];

    if (grant == "code" || (grant == "implicit" && idTokenIdx >= 0)) {
        // TODO: Hashed nonce
        const str_nonce = notStrNull(parms["nonce"], secureRandom(2));

        Object.assign(nonce, { nonce: str_nonce });
    } else {
        delete parms["nonce"];
    }

    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////

    const newParameters = {
        ...pkce,
        ...state,
        ...nonce,
    };

    config.parameters = {
        ...config.parameters,
        ...newParameters,
    };

    // The code_verifier is used by the token endpoint
    delete (newParameters as payloadType)["code_verifier"];

    const payload = {
        ...parms,
        ...newParameters,
        scope,
        response_type,
    };

    // TODO: no-storage configuration option
    setStore("config", config);

    return request<IOAuth2Parameters>(
        "HREF",
        url,
        http,
        config,
        payload as customParametersType,
        "authorization"
    ) as IOAuth2Parameters;
};

const getPkce = async (
    parms: customParametersType,
    verifier: string
) => {
    let method = parms["code_challenge_method"];

    if (!isStrNull(method))
        throw new Error(
            `The code challenge method "${method}",
            must be a string or nullish.`,
            { cause: "oauth2 authorization" },
        );

    if (!isStrNull(verifier))
        throw new Error(
            `The code verifier "${verifier}",
                must be a string or nullish.`,
            { cause: "oauth2 authorization" }
        );

    method = notStrNull(method, "S256");
    method = method.toLowerCase() == "plain" ? "plain" : method;
    method = method.toLowerCase() == "s256" ? "S256" : method;

    if (method != "plain" && method != "S256")
        throw new Error(
            `unexpected code challenge method "${method}".`,
            { cause: "oauth2 authorization" }
        );

    verifier = notStrNull(verifier, (await pkceChallenge(128)).code_verifier);

    let challenge = (parms["code_challenge"]) as
        | string
        | undefined;
    challenge = notStrNull(challenge, await generateChallenge(verifier));

    return {
        code_challenge_method: method as "S256" | "plain",
        code_verifier: verifier,
        code_challenge: challenge,
    };
}

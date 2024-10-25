import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { IOAuth2Config, IOAuth2Parameters, customParametersType, payloadType } from "../domain";
import { isStrNull, notStrNull, secureRandom } from "../utils";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";

// TODO: no-storage configuration option

/**
 * Request to then OAuth2 authorization endpoint. Redirects to the endpoint.
 *   The interceptor function inside the onInit method gets the response and actualizes
 *   the config.parameters. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param httpH ttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param options Custom parameters for the request.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _authorization = async (
    http: HttpClient,
    config: IOAuth2Config, // Parameter passed by reference updated (config.metadata)
    options = <customParametersType>{}
): Promise<IOAuth2Parameters> => {
    // Configuration data
    const no_pkce = !!config.configuration?.no_pkce;
    const no_state = !!config.configuration?.no_state;
    // TODO: authorization_grant unset
    const grant = config.configuration?.authorization_grant ?? "code";
    const authorization_endpoint = config.metadata?.authorization_endpoint;
    const URL = (options["url"] as string) ?? authorization_endpoint ?? "";
    const parms = {
        ...getParameters("authorization", config),
        ...options,
    } as customParametersType;
    const arr = (name: string) =>
        (<string[]>parms[name] ?? []).map(str => str.toLocaleLowerCase());
    const str = (name: string) => (parms[name] as string) ?? "";

    // TODO: no-storage configuration option
    setStore("test", {});

    if (!URL)
        throw new Error(
            `Values ​​for metadata 'authorization_endpoint' and option 'url' are missing.`,
            {
                cause: `oauth2 authorization`,
            }
        );

    const basicGrant = grant == "code" || grant == "implicit" || grant == "hybrid";
    let response_type = arr("response_type");
    let scope = arr("scope");
    let pkce;
    let state = {};
    let nonce = {};

    /////////
    // SCOPE

    if (!scope.length) {
        scope = ["openid", "email", "profile"];
    }

    /////////
    // RESPONSE_TYPE

    if (basicGrant || response_type.length > 1) {
        const noneIdx = response_type.indexOf("none");

        if (noneIdx >= 0) response_type.splice(noneIdx, 1);
    }

    if (grant == "code") {
        response_type = ["code"];
    }

    if (grant == "implicit") {
        // scope is not empty
        const userScopes = ["openid", "email", "profile"];
        const codeIdx = response_type.indexOf("code");
        const hasUserScope = scope.some(str => userScopes.includes(str))
        const hasApiScope = scope.some(str => !userScopes.includes(str));

        codeIdx >= 0 && response_type.splice(codeIdx, 1);

        if (!response_type.length) {
            hasUserScope && response_type.push("id_token");
            hasApiScope && response_type.push("token");
        }
    }

    /////////
    // PKCE

    // TODO: https://engineering.99x.io/demystifying-spa-security-with-pkce-fb55af7d3f5
    if (no_pkce) {
        delete parms["code_challenge"];
        delete parms["code_challenge_method"];
        delete parms["code_verifier"];
    } else if (grant == "code") {
        const code_verifier =
            parms["code_verifier"] ??
            config.token?.["code_verifier"] ??
            config.parameters?.code_verifier ??
            "";

        pkce = await getPkce(parms, code_verifier as string);
    }

    /////////
    // STATE

    if (no_state) {
        delete parms["state"];
    } else {
        const read_state = str("state");
        let str_state = notStrNull(read_state, secureRandom(2));
        if (options["statePayload"]) {
            str_state += options["statePayload"] as string;
        }
        state = { state: str_state };
    }

    /////////
    // NONCE

    const idTokenIdx = response_type.indexOf("id_token");

    if (grant == "code" || (grant == "implicit" && idTokenIdx >= 0)) {
        // TODO: Hashed nonce
        const read_nonce = str("nonce");
        const str_nonce = notStrNull(read_nonce, secureRandom(2));

        nonce = { nonce: str_nonce }
    } else {
        delete parms["nonce"]
    }

    const newParameters = {
        ...pkce,
        ...state,
        ...nonce
    };

    config.parameters = {
        ...config.parameters,
        ...newParameters,
    };

    // The code_verifier is used by the token endpoint
    delete newParameters["code_verifier"];

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
        URL,
        http,
        config,
        payload,
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
            `the code challenge method "${method}",
            must be a string or nullish.`,
            { cause: "oauth2 authorization" },
        );

    if (!isStrNull(verifier))
        throw new Error(
            `the code verifier "${verifier}",
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

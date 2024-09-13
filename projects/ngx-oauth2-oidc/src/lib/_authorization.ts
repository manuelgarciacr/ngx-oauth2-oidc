import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { IOAuth2Config, IOAuth2Parameters, customParametersType, payloadType } from "../domain";
import { isStrNull, notStrNull, secureRandom } from "../utils";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";

/**
 * Request to then OAuth2 authorization endpoint. Redirects to the endpoint.
 *   In test mode the promise returns an array with the
 *   response (or error) and the request payload.
 *
 * @param http
 * @param config
 * @param options
 * @returns
 */
export const _authorization = async (
    http: HttpClient,
    config: IOAuth2Config, // Parameter passed by reference updated (config.metadata)
    options = <customParametersType>{}
): Promise<IOAuth2Parameters | [IOAuth2Parameters, payloadType]> => {
    // Configuration data
    const test = !!config.configuration?.test;
    const no_pkce = !!config.configuration?.no_pkce;
    // TODO: authorization_grant unsetted
    const grant = config.configuration?.authorization_grant ?? "code";
    const authorization_endpoint = config.metadata?.authorization_endpoint;
    const URL = (options["url"] as string) ?? authorization_endpoint ?? "";
    const parms = {
        ...getParameters("authorization", config),
        ...options,
    } as customParametersType;
    const arr = (name: string) => (parms[name] as string[]) ?? [];
    const str = (name: string) => (parms[name] as string) ?? "";

    if (!URL) {
        const err = new Error(
            `Values ​​for metadata 'authorization_endpoint' and option 'url' are missing.`,
            {
                cause: `oauth2 authorization`,
            }
        );
        // TODO: no-storage configuration option
        setStore("test", {});
        throw test ? [err, {}] : err;
    }

    let response_type = arr("response_type");
    let scope = arr("scope");

    for (const idx in response_type)
        response_type[idx] = response_type[idx].toLowerCase();

    for (const idx in scope) scope[idx] = scope[idx].toLowerCase();

    const codeIdx = response_type.indexOf("code");
    const noneIdx = response_type.indexOf("none");
    const openidScope = scope.filter(item =>
        ["openid", "email", "profile"].includes(item)
    );
    const isOpenidScope = !!openidScope.length;
    //let hasIdToken = false;
    const hasIdToken = isOpenidScope;

    if (grant == "code") {
        codeIdx < 0 && response_type.push("code");
        noneIdx >= 0 && response_type.splice(noneIdx, 1);

        //hasIdToken = isOpenidScope
    } else {
        const multipleTypes = response_type.length > 1;

        noneIdx >= 0 && multipleTypes && response_type.splice(noneIdx, 1);
    }

    let pkce;

    if (grant == "code" && !no_pkce) {
        const code_verifier =
            parms["code_verifier"] ??
            config.token?.["code_verifier"] ??
            config.parameters?.code_verifier ??
            "";

        pkce = await getPkce(parms, code_verifier as string);
    }

    if (no_pkce) {
        delete parms["code_challenge"];
        delete parms["code_challenge_method"];
    }

    if (grant == "implicit") {
        codeIdx >= 0 && response_type.splice(codeIdx, 1);

        // if (!response_type.length){
        //     response_type = ["token", "id_token"]
        // }
    }

    let nonce = {};
    //hasIdToken = hasIdToken || response_type.includes("id_token");
    let onlyIdToken = false;
    const read_nonce = str("nonce");
    const str_nonce = notStrNull(read_nonce, secureRandom(2));

    nonce = { nonce: str_nonce };

    if (hasIdToken) {
        // const read_nonce = str("nonce");
        // const str_nonce = notStrNull(read_nonce, secureRandom());

        // nonce = {nonce: str_nonce};

        if (response_type.length == 1) {
            onlyIdToken = true;
        }
    }

    if (grant == "code" && !scope.length) {
        scope = ["openid"];
    }

    let state = str("state");

    state = notStrNull(state, secureRandom(2));

    if (options["statePayload"]) {
        state += options["statePayload"] as string;
    }

    const { code_verifier, ...pkceOptions } = pkce ?? {};

    const newOptions = {
        state,
        ...nonce,
        ...pkceOptions,
    };

    config.parameters = {
        ...config.parameters,
        ...newOptions,
        code_verifier,
    };

    // TODO: no-storage configuration option
    setStore("config", config);

    return request<IOAuth2Parameters>(
        "HREF",
        URL,
        http,
        config,
        { ...parms, ...newOptions, scope, response_type },
        "authorization"
    );
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

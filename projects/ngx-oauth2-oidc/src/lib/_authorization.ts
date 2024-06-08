import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { IOAuth2Config, IOAuth2Configuration, IOAuth2Parameters, customParametersType } from "../domain";
import { notStrNull, secureRandom } from "../utils";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getEndpointParameters } from "./_oauth2ConfigFactory";
import { setStore } from "./_store";
import { initConfig } from "./_initConfig";

export const _authorization = async (
    http: HttpClient,
    ioauth2Config: IOAuth2Config | null,
    options = <customParametersType>{},
) => {
    const config = initConfig(ioauth2Config);
    const cfg = config.configuration;
    const parms = getEndpointParameters("authorization", config);
    const meta = config.metadata;
    const grant = cfg.authorization_grant_type;

    const url =
        (options["url"] as string) ??
        meta?.authorization_endpoint ??
        "";

    if (!url)
        throw new Error(
            `Values ​​for metadata 'authorization_endpoint' and option 'url' are missing.`,
            { cause: "oauth2 authorization" }
        );

    const response_type = (
        options["response_type"] ??
        parms?.["response_type"] ??
        []
    ) as string[];

    if (grant == "code") {
        for (const idx in response_type)
            response_type[idx] = response_type[idx].toLowerCase();
        const idx = response_type.indexOf("code");
        idx < 0 && response_type.push("code");
    }

    if (grant == "implicit") {
        for (const idx in response_type)
            response_type[idx] = response_type[idx].toLowerCase();
        const idx = response_type.indexOf("code");
        idx >= 0 && response_type.splice(idx, 1);
    }

    if (!response_type.length)
        throw new Error(
            `Values ​​for parameter 'response_type' and configuration option 'authorization_grant_type' are missing.`,
            { cause: "oauth2 authorization" }
        );

    let state = (
        options["state"] ??
        parms?.["state"]
    ) as string | undefined;

    state = notStrNull(state, secureRandom());

    if (options["statePayload"]) {
        state += options["statePayload"] as string;
    }

    let method = (
        options["code_challenge_method"] ??
        parms?.["code_challenge_method"]
    ) as "S256" | "plain" | undefined;

    method = notStrNull(method, "S256") as "S256" | "plain";
    method = method.toLowerCase() == "plain" ? "plain" : "S256";

    let verifier = (options["code_verifier"] ??
        config.configuration.token?.["code_verifier"] ??
        config.parameters.code_verifier
    ) as string | undefined;

    verifier = notStrNull(verifier, (await pkceChallenge(128)).code_verifier);

    let challenge = (
        options["code_challenge"] ??
        parms?.["code_challenge"]
    ) as string | undefined;

    challenge = notStrNull(challenge, await generateChallenge(verifier));

    let nonce = (
        options["nonce"] ??
        parms?.["nonce"]
    ) as string | undefined;

    nonce = notStrNull(nonce, secureRandom());

    // const hasIdToken = response_type.includes("id_token");

    // if (hasIdToken) {
    //     options["nonce"] = secureRandom();
    // }

    const newOptions = {
        state,
        code_challenge_method: method,
        code_challenge: challenge,
        nonce
    };

    config.parameters = { ...config.parameters, ...newOptions, code_verifier: verifier };

    setStore("config", config);

    return request<IOAuth2Parameters>(
        "authorization",
        "GET",
        "href",
        url,
        http,
        config,
        { ...parms, ...options, ...newOptions }
    )
};

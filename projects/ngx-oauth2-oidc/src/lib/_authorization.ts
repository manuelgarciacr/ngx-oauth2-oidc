import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { IOAuth2Config, IOAuth2Configuration, IOAuth2Parameters, customParametersType } from "../domain";
import { notStrNull, secureRandom } from "../utils";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { initConfig } from "./_initConfig";

export const _authorization = async (
    http: HttpClient,
    ioauth2Config: IOAuth2Config | null,
    options = <customParametersType>{},
) => {
    const config = initConfig(ioauth2Config);
    const cfg = config.configuration!;
    const parms = getParameters("authorization", config);
    const meta = config.metadata!;
    const grant = cfg.authorization_grant!;
    const arr = (name: string) => (options[name] as string[]) ?? parms[name] ?? [];
    const str = (name: string) => (options[name] as string) ?? parms[name] ?? "";
    const url =
        (options["url"] as string) ?? meta.authorization_endpoint ?? "";

    if (!url)
        throw new Error(
            `Values ​​for metadata 'authorization_endpoint' and option 'url' are missing.`,
            { cause: "oauth2 authorization" }
        );

    let response_type = arr("response_type");
    let scope = arr("scope");

    for (const idx in response_type)
        response_type[idx] = response_type[idx].toLowerCase();
    for (const idx in scope)
        scope[idx] = scope[idx].toLowerCase();

    const codeIdx = response_type.indexOf("code");
    const openidScope = scope.filter(item =>
        ["openid", "email", "profile"].includes(item)
    );
    const isOpenidScope = !!openidScope.length;
    let hasIdToken = false;
    let pkce;

    if (grant == "code") {
        codeIdx < 0 && response_type.push("code");

        pkce = await getPkce(options, parms, cfg);
        hasIdToken = isOpenidScope
    }

    if (grant == "implicit") {
        codeIdx >= 0 && response_type.splice(codeIdx, 1);

        if (!response_type.length){
            response_type = ["token", "id_token"]
        }
    }

    let nonce;
    hasIdToken = hasIdToken || response_type.includes("id_token");
    let onlyIdToken = false;

    if (hasIdToken) {
        const read_nonce = str("nonce");
        const str_nonce = notStrNull(read_nonce, secureRandom());

        nonce = {nonce: str_nonce};

        if (response_type.length == 1) {
            onlyIdToken = true
        }
    }

    if (onlyIdToken && !isOpenidScope) {
        scope = ["openid", "email", "profile"]
    }

    let state = str("state");

    state = notStrNull(state, secureRandom());

    if (options["statePayload"]) {
        state += options["statePayload"] as string;
    }

    const {code_verifier, ...pkceOptions} = pkce ?? {};

    const newOptions = {
        state,
        ...nonce,
        ...pkceOptions
    };

    config.parameters = {
        ...config.parameters,
        ...newOptions,
        code_verifier
    };

    setStore("config", config);

    return request<IOAuth2Parameters>(
        "authorization",
        "GET",
        "href",
        url,
        http,
        config,
        { ...parms, ...options, ...newOptions, scope, response_type }
    );
};

const getPkce = async (
    options: customParametersType,
    parms: customParametersType,
    configuration: IOAuth2Configuration
) => {
    let method = (options["code_challenge_method"] ??
        parms["code_challenge_method"]);

    method = notStrNull(method, "S256");
    method = method.toLowerCase() == "plain" ? "plain" : "S256";

    let verifier = options["code_verifier"] ??
        configuration.token?.["code_verifier"];

    verifier = notStrNull(verifier, (await pkceChallenge(128)).code_verifier);

    let challenge = (options["code_challenge"] ?? parms?.["code_challenge"]) as
        | string
        | undefined;

    challenge = notStrNull(challenge, await generateChallenge(verifier));

    return {
        code_challenge_method: method as "S256" | "plain",
        code_verifier: verifier,
        code_challenge: challenge,
    };
}

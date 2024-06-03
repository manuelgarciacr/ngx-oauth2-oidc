import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Parameters, customParameters, oauth2Configuration } from "../domain";
import { debugFn, secureRandom } from "../utils";
import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { setStore } from "./_store";
import { httpRequest } from "./_httpRequest";

export const request = async <T>(
    type: string,
    method: string,
    request: string,
    config: IOAuth2Config | null,
    http: HttpClient,
    customParms?: customParameters
) => {
    debugFn("prv", "REQUEST", type, customParms);
    const configuration = config?.configuration as oauth2Configuration;
    const endpointType = type == "refresh" ? "token" : type;
    const configParamsKey = (type + "_params") as keyof oauth2Configuration;
    const configCustomKey = (type + "_custom") as keyof oauth2Configuration;
    const metadataKey = (endpointType + "_endpoint") as keyof IOAuth2Metadata;
    const request_params =
        (configuration[configParamsKey] as (keyof IOAuth2Parameters)[]) ??
        [];
    const req_custom = configuration[configCustomKey] as customParameters;
    const request_custom = {
        ...(req_custom ?? {}),
        ...(customParms ?? {}),
    };
    const endpoint = (config?.metadata[metadataKey] as string) ?? "";

    if (!config) throw `oauth2 ${type}: no configuration defined`;

    if (!endpoint) throw `oauth2 ${type}: missing endpoint`;

    const parameters = config.parameters ?? <IOAuth2Parameters>{};
    let params = new HttpParams({ fromObject: {} });

    for await (const key of request_params) {
        if (key == "state") parameters.state = secureRandom();

        if (key == "nonce") parameters.nonce = secureRandom();

        const isChallenge =
            key == "code_challenge" || key == "code_challenge_method";

        if (isChallenge && !parameters.code_challenge) {
            const method =
                config.parameters.code_challenge_method ?? "plain";
            const { code_verifier } = await pkceChallenge(128);
            parameters.code_challenge =
                method.toLowerCase() == "plain"
                    ? code_verifier
                    : await generateChallenge(code_verifier);
            parameters.code_challenge_method = method;
            parameters.code_verifier = code_verifier;
        }

        let v = parameters![key]; // configuration value
        Array.isArray(v) && (v = v.join(" "));
        if (v) params = params.set(key, v.toString());
    }

    if (request_params.length) {
        config.parameters = parameters;
        setStore("config", config);
    }

    for (const key in request_custom) {
        let v = request_custom[key];

        Array.isArray(v) && (v = v.join(" "));
        if (v) params = params.set(key, v.toString());
    }

    const headers = new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    });

    if (request == "href") {
        const req = new HttpRequest<T>(method, endpoint, null, {
            //headers,
            params,
        });
        location.href = req.urlWithParams;
        return;
    } else {
        const req =
            method.toUpperCase() == "POST"
                ? http.post<T>(endpoint, params, {
                        headers,
                        observe: "body",
                    })
                : http.get<T>(endpoint, {
                        headers,
                        params,
                        observe: "body",
                    });
        return httpRequest(req, config!);
    }
};

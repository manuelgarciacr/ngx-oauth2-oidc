import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getEndpointParameters } from "./_oauth2ConfigFactory";
import { initConfig } from "./_initConfig";

export const _token = async (
    http: HttpClient,
    ioauth2Config: IOAuth2Config | null,
    options = <customParametersType>{}
) => {
    const config = initConfig(ioauth2Config);
    const cfg = config.configuration;
    const parms = getEndpointParameters("token", config);
    const meta = config.metadata;
    const grant = cfg.authorization_grant_type;

    const url = (options["url"] as string) ?? meta?.token_endpoint ?? "";

    if (!url)
        throw new Error(
            `Values ​​for metadata 'token_endpoint' and option 'url' are missing.`,
            { cause: "oauth2 token" }
        );

    const grant_type = (
        options["grant_type"] ?? parms?.["grant_type"] ?? grant == "code"
            ? "authorization_code"
            : undefined
    ) as string | undefined;

    if (!grant_type)
        throw new Error(
            `Values ​​for parameter 'grant_type' and configuration option 'authorization_grant_type' are missing.`,
            { cause: "oauth2 authorization" }
        );

    return request<IOAuth2Parameters>(
        "token",
        "POST",
        "http",
        url,
        http,
        config!,
        { ...parms, ...options, grant_type }
    );
};

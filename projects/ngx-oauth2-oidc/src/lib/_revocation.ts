import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";

export const _revocation = async (
    http: HttpClient,
    ioauth2Config: IOAuth2Config | null,
    options = <customParametersType>{}
) => {
    const config = ioauth2Config ?? {};
    const parms = {
        ...getParameters("revocation", config),
        ...options,
    } as customParametersType;
    const meta = config.metadata!;
    const url = (options["url"] as string) ?? meta.revocation_endpoint ?? "";

    if (!url)
        throw new Error(
            `Values ​​for metadata 'revocation_endpoint' and option 'url' are missing.`,
            { cause: "oauth2 revocation" }
        );

    const token_type_hint = parms["token_type_hint"];
    const access_token = parms["access_token"];
    const refresh_token = parms["refresh_token"];

    let token = options["token"] ??
        options["access_token"] ??
        options["refresh_token"] ??
        (!access_token || token_type_hint == "refresh_token" && !!refresh_token?
            refresh_token :
            access_token
        );

    if (!token)
        throw new Error(
            `Values ​​for parameters "access_token" and "refresh_token" and option 'token' are missing.`,
            { cause: "oauth2 revocation" }
        );

    delete parms["access_token"];
    delete parms["refresh_token"];

    return request<IOAuth2Parameters>(
        "POST",
        url,
        http,
        config!,
        { ...parms, token },
        "revocation"
    );
};

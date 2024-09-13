import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { getParameters } from "./_getParameters";

export const _token = async (
    http: HttpClient,
    ioauth2Config: IOAuth2Config,
    options = <customParametersType>{}
) => {
    const config = ioauth2Config ?? {};
    const cfg = config.configuration!;
    const no_pkce = !!cfg.no_pkce;
    const parms = {
        ...getParameters("token", config),
        ...options
    } as customParametersType;
    const meta = config.metadata!;
    const url = (options["url"] as string) ?? meta.token_endpoint ?? "";
    const grant_type = parms["grant_type"];

    if (!grant_type)
        throw new Error(
            `Value ​​for option 'grant_type' is missing.`,
            { cause: `oauth2 token` }
        );

    if (!url)
        throw new Error(
            `Values ​​for metadata 'token_endpoint' and option 'url' are missing.`,
            { cause: `oauth2 token ${grant_type}` }
        );

    if (grant_type == "authorization_code") {
        delete parms["assertion"];
        //delete parms["client_assertion"];
        delete parms["device_code"];
        delete parms["refresh_token"];
    }

    if (grant_type == "refresh_token") {
        delete parms["assertion"];
        //delete parms["client_assertion"];
        delete parms["code"];
        delete parms["code_verifier"];
        delete parms["device_code"];
    }

    if (no_pkce) {
        delete parms["code_verifier"];
    }

    return request<IOAuth2Parameters>(
        "POST",
        url,
        http,
        config!,
        parms,
        "token"
    );
};

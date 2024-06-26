import {
    IOAuth2Config,
    IOAuth2Parameters,
    customParametersType,
} from "../domain";
import { request } from "./_request";
import { HttpClient } from "@angular/common/http";
import { initConfig } from "./_initConfig";
import { getParameters } from "./_getParameters";

export const _token = async (
    http: HttpClient,
    ioauth2Config: IOAuth2Config | null,
    options = <customParametersType>{}
) => {
    const config = initConfig(ioauth2Config);
    const cfg = config.configuration!;
    const parms = getParameters("token", config);
    const meta = config.metadata!;
    const grant = cfg.authorization_grant;
    const str = (name: string) =>
        (options[name] as string) ?? parms[name] ?? "";
    const url = (options["url"] as string) ?? meta.token_endpoint ?? "";

    let grant_type = str("grant_type");

    if (
        grant == "code" &&
        grant_type != "authorization_code" &&
        grant_type != "refresh_token"
    ) {
        grant_type = "authorization_code";
    }

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

    return request<IOAuth2Parameters>(
        "token",
        "POST",
        "http",
        url,
        http,
        config!,
        { ...parms, grant_type, ...options }
    );
};

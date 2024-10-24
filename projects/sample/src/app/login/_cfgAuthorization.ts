import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgAuthorization(
    this: LoginComponent,
    reset: boolean,
    config: IOAuth2Config,
    newCfg: IOAuth2Config,
) {
    let access_type, include_granted_scopes, enable_granular_consent;

    if (reset) {
        access_type = include_granted_scopes = enable_granular_consent = "";

        this.access_type.set(access_type);
        this.include_granted_scopes.set(include_granted_scopes);
        this.enable_granular_consent.set(enable_granular_consent);
    } else {
        const oldAccess =
            config.authorization?.["access_type"] ?? "";
        const oldInclude =
            config.authorization?.["include_granted_scopes"] ??
            "";
        const oldEnable =
            config.authorization?.["enable_granular_consent"] ??
            "";

        access_type = this.access_type();
        include_granted_scopes =
            this.include_granted_scopes() === ""
                ? ""
                : this.include_granted_scopes() === "true";
        enable_granular_consent =
            this.enable_granular_consent() === ""
                ? ""
                : this.enable_granular_consent() === "true";

        reset =
            reset ||
            oldAccess !== access_type ||
            oldInclude !== include_granted_scopes ||
            oldEnable !== enable_granular_consent;
    }

    newCfg.authorization ??= {};
    newCfg.authorization["access_type"] = this.access_type();
    newCfg.authorization["include_granted_scopes"] =
        include_granted_scopes;
    newCfg.authorization["enable_granular_consent"] =
        enable_granular_consent;

    if (!newCfg.authorization["access_type"])
        delete newCfg.authorization["access_type"];
    if (this.include_granted_scopes() == "")
        delete newCfg.authorization["include_granted_scopes"];
    if (this.enable_granular_consent() == "")
        delete newCfg.authorization["enable_granular_consent"];

    // const authorization = newCfg.configuration?.authorization ?? {};

    // delete authorization["access_type"];
    // delete authorization["include_granted_scopes"];
    // delete authorization["enable_granular_consent"];

    // newCfg.configuration ??= {};
    // newCfg.configuration.authorization = {
    //     ...authorization,
    //     ...(access_type && { access_type }),
    //     ...(include_granted_scopes !== "" && {
    //         include_granted_scopes,
    //     }),
    //     ...(enable_granular_consent !== "" && {
    //         enable_granular_consent,
    //     }),
    // };

    if (!Object.keys(newCfg.authorization).length)
        delete newCfg.authorization;

    return reset;
}

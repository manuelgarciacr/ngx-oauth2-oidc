import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgAuthorization(
    this: LoginComponent,
    reset: boolean,
    config: IOAuth2Config,
    newCfg: IOAuth2Config,
    exampleConfig: IOAuth2Config
) {
    let access_type, include_granted_scopes, enable_granular_consent;

    if (reset) {
        access_type = include_granted_scopes = enable_granular_consent = "";

        this.access_type.set(access_type);
        this.include_granted_scopes.set(include_granted_scopes);
        this.enable_granular_consent.set(enable_granular_consent);
    } else {
        const oldAccess =
            config.configuration?.authorization?.["access_type"] ?? "";
        const oldInclude =
            config.configuration?.authorization?.["include_granted_scopes"] ??
            "";
        const oldEnable =
            config.configuration?.authorization?.["enable_granular_consent"] ??
            "";

        access_type = this.access_type();
        include_granted_scopes = this.include_granted_scopes();
        enable_granular_consent = this.enable_granular_consent();

        reset =
            reset ||
            oldAccess != access_type ||
            oldInclude != include_granted_scopes ||
            oldEnable != enable_granular_consent;
    }

    newCfg.configuration ??= {};
    newCfg.configuration.authorization ??= {};
    newCfg.configuration.authorization["access_type"] = this.access_type();
    newCfg.configuration.authorization["include_granted_scopes"] =
        this.include_granted_scopes();
    newCfg.configuration.authorization["enable_granular_consent"] =
        this.enable_granular_consent();

    if (!newCfg.configuration.authorization["access_type"])
        delete newCfg.configuration.authorization["access_type"];
    if (!newCfg.configuration.authorization["include_granted_scopes"])
        delete newCfg.configuration.authorization["include_granted_scopes"];
    if (!newCfg.configuration.authorization["enable_granular_consent"])
        delete newCfg.configuration.authorization["enable_granular_consent"];

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

    if (!Object.keys(newCfg.configuration.authorization).length)
        delete newCfg.configuration.authorization;

    if (!Object.keys(newCfg.configuration).length) delete newCfg.configuration;

    return reset;
}

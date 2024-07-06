import { IOAuth2Config, IOAuth2VerifyTokenJoseOptions, IOAuth2VerifyTokenParameters } from "ngx-oauth2-oidc";

export function cfgExample(
    newCfg: IOAuth2Config,
    exampleConfig: IOAuth2Config
) {
    newCfg.configuration ??= {};

    newCfg.metadata =
        exampleConfig.metadata ?? {};
    newCfg.parameters =
        exampleConfig.parameters ?? {};

    newCfg.configuration.authorization =
        exampleConfig.configuration?.authorization ?? {};
    newCfg.configuration.token =
        exampleConfig.configuration?.token ?? {};
    newCfg.configuration.refresh =
        exampleConfig.configuration?.refresh ?? {};
    newCfg.configuration.verify_token =
        exampleConfig.configuration?.verify_token ??
        ({} as IOAuth2VerifyTokenParameters & IOAuth2VerifyTokenJoseOptions);
    newCfg.configuration.revocation =
        exampleConfig.configuration?.revocation ?? {};

    if (!Object.keys(newCfg.configuration.authorization).length)
        delete newCfg.configuration.authorization;

    if (!Object.keys(newCfg.configuration.token).length)
        delete newCfg.configuration.token;

    if (!Object.keys(newCfg.configuration.refresh).length)
        delete newCfg.configuration.refresh;

    if (!Object.keys(newCfg.configuration.verify_token).length)
        delete newCfg.configuration.verify_token;

    if (!Object.keys(newCfg.configuration.revocation).length)
        delete newCfg.configuration.revocation;

    if (!Object.keys(newCfg.configuration).length) delete newCfg.configuration;
    if (!Object.keys(newCfg.metadata).length) delete newCfg.metadata;
    if (!Object.keys(newCfg.parameters).length) delete newCfg.parameters;

}

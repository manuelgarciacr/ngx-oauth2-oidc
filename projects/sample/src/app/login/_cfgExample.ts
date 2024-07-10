import { IOAuth2Config, IOAuth2VerifyTokenJoseOptions, IOAuth2VerifyTokenParameters } from "ngx-oauth2-oidc";

export function cfgExample(
    newCfg: IOAuth2Config,
    exampleConfig: IOAuth2Config
) {
    newCfg.metadata =
        exampleConfig.metadata ?? {};
    newCfg.parameters =
        exampleConfig.parameters ?? {};

    newCfg.authorization =
        exampleConfig.authorization ?? {};
    newCfg.token =
        exampleConfig.token ?? {};
    newCfg.refresh =
        exampleConfig.refresh ?? {};
    newCfg.verify_token =
        exampleConfig.verify_token ??
        ({} as IOAuth2VerifyTokenParameters & IOAuth2VerifyTokenJoseOptions);
    newCfg.revocation =
        exampleConfig.revocation ?? {};

    if (!Object.keys(newCfg.authorization).length)
        delete newCfg.authorization;

    if (!Object.keys(newCfg.token).length)
        delete newCfg.token;

    if (!Object.keys(newCfg.refresh).length)
        delete newCfg.refresh;

    if (!Object.keys(newCfg.verify_token).length)
        delete newCfg.verify_token;

    if (!Object.keys(newCfg.revocation).length)
        delete newCfg.revocation;

    if (!Object.keys(newCfg.metadata).length) delete newCfg.metadata;
    if (!Object.keys(newCfg.parameters).length) delete newCfg.parameters;

}

import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";
import { customParametersType } from "../../../../ngx-oauth2-oidc/src/domain";

export function cfgClient(
    this: LoginComponent,
    reset: boolean,
    config: IOAuth2Config,
    newCfg: IOAuth2Config,
    exampleConfig: IOAuth2Config,
    credentials: customParametersType
) {
    let client_id, client_secret;

    if (reset) {
        client_id = exampleConfig.parameters?.client_id ?? "";
        client_secret = (credentials["client_secret"] as string) ?? "";

        this.client_id.set(client_id);
        this.client_secret.set(client_secret);
    } else {
        const oldClientId = config.parameters?.client_id ?? "";
        const oldClientSecret = config.parameters?.client_secret ?? "";

        client_id = this.client_id();
        client_secret = this.client_secret();

        reset =
            reset ||
            oldClientId != client_id ||
            oldClientSecret != client_secret;
    }

    newCfg.parameters ??= {};
    newCfg.parameters.client_id = this.client_id();
    newCfg.parameters.client_secret = this.client_secret();

    if (!newCfg.parameters.client_id) delete newCfg.parameters.client_id;
    if (!newCfg.parameters.client_secret)
        delete newCfg.parameters.client_secret;

    if (!Object.keys(newCfg.parameters).length) delete newCfg.parameters;

    return reset;
}

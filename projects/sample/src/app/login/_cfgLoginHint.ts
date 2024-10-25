import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgLoginHint(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {
    let login_hint;

    if (reset) {
        login_hint = "";
        this.login_hint.set(login_hint)
    } else {
        const oldLoginHint = config.parameters?.login_hint ?? "";

        login_hint = this.login_hint();
        reset = reset || oldLoginHint != login_hint;
    }

    newCfg.parameters ??= {};
    newCfg.parameters.login_hint = this.login_hint();

    if (!newCfg.parameters.login_hint) delete newCfg.parameters.login_hint;

    if (!Object.keys(newCfg.parameters).length) delete newCfg.parameters;

    return reset
}

import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgRedirectUri(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {
    let redirect_uri;

    if (reset) {
        redirect_uri = window.location.href.split("?")[0];
        this.redirect_uri.set(redirect_uri)
    } else {
        const oldRedirectUri = config.parameters?.redirect_uri ?? "";

        redirect_uri = this.redirect_uri();
        reset = reset || oldRedirectUri != redirect_uri;
    }

    newCfg.parameters ??= {};
    newCfg.parameters.redirect_uri = this.redirect_uri();

    if (!newCfg.parameters.redirect_uri) delete newCfg.parameters.redirect_uri;

    if (!Object.keys(newCfg.parameters).length) delete newCfg.parameters;

    return reset
}

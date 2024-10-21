import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgScope(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {
    let openid, email, profile, api_scope;

    if (reset) {
        openid = email = profile = api_scope = false;
        this.openid.set(openid);
        this.email.set(email);
        this.profile.set(profile);
        this.api_scope.set(api_scope);
        const initialScope = newCfg.parameters?.scope ?? [];
        const api_scope_string = initialScope
            .filter(v => v !== "openid" && v !== "email" && v !== "profile")
            .reduce((_, value) => value, "")
            .trim();
        this.api_scope_string.set(api_scope_string)
    } else {
        const scope = config.parameters?.scope ?? [];

        const oldOpenid = scope.includes("openid");
        const oldEmail = scope.includes("email");
        const oldProfile = scope.includes("profile");
        const api_scope_string = scope.filter(v => v !== "openid" && v !== "email" && v !== "profile")
            .reduce((_, value) => value, "").trim()
        const oldApiScope = api_scope_string != "";

        openid = this.openid();
        email = this.email();
        profile = this.profile();
        api_scope = this.api_scope();

        reset =
            reset ||
            oldOpenid != openid ||
            oldEmail != email ||
            oldProfile != profile ||
            oldApiScope != api_scope;
    }

    newCfg.parameters ??= {}
    newCfg.parameters.scope = this.scope();

    if (!newCfg.parameters.scope.length)
        delete newCfg.parameters.scope;

    if (!Object.keys(newCfg.parameters).length)
        delete newCfg.parameters;

    return reset
}

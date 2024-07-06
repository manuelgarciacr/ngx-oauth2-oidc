import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgResponse(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {
    let code, token, id_token, none;

    if (reset) {
        code = token = id_token = none = false;

        this.code.set(code);
        this.token.set(token);
        this.id_token.set(id_token);
        this.none.set(none);
    } else {
        const response_type = config.parameters?.response_type ?? [];

        const oldCode = response_type.includes("code");
        const oldToken = response_type.includes("token");
        const oldIdToken = response_type.includes("id_token");
        const oldNone = response_type.includes("none");

        code = this.code();
        token = this.token();
        id_token = this.id_token();
        none = this.none();

        reset =
            reset ||
            oldCode != code ||
            oldToken != token ||
            oldIdToken != id_token ||
            oldNone != none;
    }

    newCfg.parameters ??= {};
    newCfg.parameters.response_type = this.response_type();

    if (!newCfg.parameters.response_type.length)
        delete newCfg.parameters.response_type;

    if (!Object.keys(newCfg.parameters).length)
        delete newCfg.parameters;

    return reset
}

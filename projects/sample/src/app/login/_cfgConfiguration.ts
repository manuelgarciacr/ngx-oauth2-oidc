import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgConfiguration(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {

    let authorization_grant;
    let no_pkce, no_state, test;

    if (reset) {
        authorization_grant = "code";
        no_pkce = no_state = false;
        test = true;

        this.authorization_grant.set(authorization_grant as "code");
        this.no_pkce.set(false);
        this.no_state.set(false);
        this.test.set(true)
    } else {
        const oldAuthorizationGrant = config.configuration?.authorization_grant;
        const old_no_pkce = config.configuration?.no_pkce;
        const old_no_state = config.configuration?.no_state;
        const old_test = config.configuration?.test;

        authorization_grant = this.authorization_grant();
        no_pkce = this.no_pkce();
        no_state = this.no_state();
        test = this.test();

        reset =
            reset ||
            oldAuthorizationGrant != authorization_grant ||
            !!old_no_pkce != no_pkce ||
            !!old_no_state != no_state ||
            !!old_test != test;
    }

    newCfg.configuration ??= {};
    newCfg.configuration.authorization_grant = this.authorization_grant();
    no_pkce && (newCfg.configuration.no_pkce = true);
    no_state && (newCfg.configuration.no_state = true);
    test && (newCfg.configuration.test = true);

    if (!newCfg.configuration.authorization_grant) delete newCfg.configuration.authorization_grant;

    if (!Object.keys(newCfg.configuration).length) delete newCfg.configuration;

    return reset
}

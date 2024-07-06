import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgConfiguration(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {

    let authorization_grant;
    let no_discovery, no_pkce, no_state, no_nonce;

    if (reset) {
        authorization_grant = "code";
        no_discovery = no_pkce = no_state = no_nonce = false;

        this.authorization_grant.set(authorization_grant as "code");
        this.no_discovery.set(false);
        this.no_pkce.set(false);
        this.no_state.set(false);
        this.no_nonce.set(false);
    } else {
        const oldAuthorizationGrant = config.configuration?.authorization_grant;
        const old_no_discovery = config.configuration?.no_discovery;
        const old_no_pkce = config.configuration?.no_pkce;
        const old_no_state = config.configuration?.no_state;
        const old_no_nonce = config.configuration?.no_nonce;

        authorization_grant = this.authorization_grant();
        no_discovery = this.no_discovery();
        no_pkce = this.no_pkce();
        no_state = this.no_state();
        no_nonce = this.no_nonce();

        reset =
            reset ||
            oldAuthorizationGrant != authorization_grant ||
            !!old_no_discovery != no_discovery ||
            !!old_no_pkce != no_pkce ||
            !!old_no_state != no_state ||
            !!old_no_nonce != no_nonce;
    }

    newCfg.configuration ??= {};
    newCfg.configuration.authorization_grant = this.authorization_grant();
    no_discovery && (newCfg.configuration.no_discovery = true);
    no_pkce && (newCfg.configuration.no_pkce = true);
    no_state && (newCfg.configuration.no_state = true);
    no_nonce && (newCfg.configuration.no_nonce = true);

    if (!newCfg.configuration.authorization_grant) delete newCfg.configuration.authorization_grant;

    if (!Object.keys(newCfg.configuration).length) delete newCfg.configuration;

    return reset
}

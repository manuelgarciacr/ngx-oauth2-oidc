import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgOptions(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config ) {

    let no_discovery, no_pkce, no_state, no_nonce;

    if (reset) {
        no_discovery = no_pkce = no_state = no_nonce = false;

        this.no_discovery.set(false);
        this.no_pkce.set(false);
        this.no_state.set(false);
        this.no_nonce.set(false)
    } else {
        const old_no_discovery = config?.configuration?.no_discovery;
        const old_no_pkce = config?.configuration?.no_pkce;
        const old_no_state = config?.configuration?.no_state;
        const old_no_nonce = config?.configuration?.no_nonce;

        no_discovery = this.no_discovery();
        no_pkce = this.no_pkce();
        no_state = this.no_state();
        no_nonce = this.no_nonce();

        reset =
            reset ||
            !!old_no_discovery != no_discovery ||
            !!old_no_pkce != no_pkce ||
            !!old_no_state != no_state ||
            !!old_no_nonce != no_nonce;
    }

    newCfg.configuration ??= {};
    no_discovery && (newCfg.configuration.no_discovery = true);
    no_pkce && (newCfg.configuration.no_pkce = true);
    no_state && (newCfg.configuration.no_state = true);
    no_nonce && (newCfg.configuration.no_nonce = true);

    if (!Object.keys(newCfg.configuration).length)
        delete newCfg.configuration;

    return reset
}

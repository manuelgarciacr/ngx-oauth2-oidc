import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgMetadata(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config, exampleConfig: IOAuth2Config) {
    let issuer;

    if (reset) {
        issuer = exampleConfig.metadata?.issuer ?? "";

        this.issuer.set(issuer)
    } else {
        const oldIssuer = config.metadata?.issuer ?? "";

        issuer = this.issuer();

        reset = reset || oldIssuer != issuer;
    }

    newCfg.metadata ??= {};
    newCfg.metadata.issuer = this.issuer();

    if (!newCfg.metadata.issuer) delete newCfg.metadata.issuer;

    if (!Object.keys(newCfg.metadata).length) delete newCfg.metadata;

    return reset;
}

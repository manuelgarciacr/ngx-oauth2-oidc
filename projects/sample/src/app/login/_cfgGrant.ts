import { IOAuth2Config } from "ngx-oauth2-oidc";
import { LoginComponent } from "./login.component";

export function cfgGrant(this: LoginComponent, reset: boolean, config: IOAuth2Config, newCfg: IOAuth2Config, exampleConfig: IOAuth2Config ) {

    let authorization_grant;

    if (reset) {
        authorization_grant = "code";

        this.authorization_grant.set(authorization_grant);
    } else {
        const old = config?.configuration?.authorization_grant;

        authorization_grant = this.authorization_grant();

        reset = reset || old != authorization_grant;
    }

    authorization_grant =  authorization_grant as "code" | "implicit" | undefined

    const client_id = this.client_id();
    const authorization = exampleConfig.configuration?.authorization ?? {};
    const token = exampleConfig.configuration?.token ?? {};
    delete token["client_secret"];
    const metadata = exampleConfig.metadata ?? {};
    const parameters = exampleConfig.parameters ?? {};
    delete parameters["client_id"];
    delete parameters["redirect_uri"];
    delete parameters["scope"];
    delete parameters["response_type"];

    newCfg.configuration = {
        ...newCfg.configuration,
        authorization_grant,
        ...(Object.keys(authorization).length && {
            authorization,
        }),
        ...(Object.keys(token).length && {
            token,
        }),
    };

    newCfg.metadata = {...metadata};

    newCfg.parameters = {
        ...parameters,
        client_id,
        redirect_uri: this.redirect_uri(),
    };

    return reset
}

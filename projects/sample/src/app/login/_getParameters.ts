import { LoginComponent } from "./login.component";

export function getParameters(this: LoginComponent ) {
    const strObject = sessionStorage.getItem("pr");

    if (strObject) {
        const object = JSON.parse(strObject);
        this.api.set(object.api);
        this.client_id.set(object.client_id);
        this.client_secret.set(object.client_secret);
        // CONFIGURATION -> AUTHORIZATION_GRANT
        this.authorization_grant.set(object.authorization_grant);
        // CONFIGURATION -> OPTIONS
        this.no_discovery.set(object.no_discovery);
        this.no_pkce.set(object.no_pkce);
        this.no_state.set(object.no_state);
        this.no_nonce.set(object.no_nonce);
        // AUTHORIZATION -> CUSTOM GOOGLE PARAMETERS
        this.access_type.set(object.access_type);
        this.include_granted_scopes.set(object.include_granted_scopes);
        this.enable_granular_consent.set(object.enable_granular_consent);
        // PARAMETERS -> RESPONSE_TYPE
        this.code.set(object.code);
        this.token.set(object.token);
        this.id_token.set(object.id_token);
        this.none.set(object.none);
        // PARAMETERS -> SCOPE
        this.openid.set(object.openid);
        this.email.set(object.email);
        this.profile.set(object.profile);
        this.api_scope.set(object.api_scope);
        // TEXT MODIFIED
        this.textModified.set(object.textModified);
    }
}

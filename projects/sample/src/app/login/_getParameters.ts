import { LoginComponent } from "./login.component";

export function getParameters(this: LoginComponent ) {
    const strObject = sessionStorage.getItem("pr");

    if (strObject) {
        const object = JSON.parse(strObject);
        // AUTHORIZATION SERVER CREDENTIALS
        this.api.set(object.api);
        // CONFIGURATION
        this.authorization_grant.set(object.authorization_grant);
        //this.no_discovery.set(object.no_discovery);
        this.no_pkce.set(object.no_pkce);
        this.no_state.set(object.no_state);
        this.no_nonce.set(object.no_nonce);
        this.test.set(object.test);
        // AUTHORIZATION -> CREDENTIALS-DEPENDENT
        this.access_type.set(object.access_type);
        this.include_granted_scopes.set(object.include_granted_scopes);
        this.enable_granular_consent.set(object.enable_granular_consent);
        // METADATA -> CREDENTIALS-DEPENDENT
        this.issuer.set(object.issuer);
        // PARAMETERS -> CREDENTIALS-DEPENDENT
        this.client_id.set(object.client_id);
        this.client_secret.set(object.client_secret);
        // PARAMETERS -> REDIRECT_URI
        this.redirect_uri.set(object.redirect_uri);
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
        // REQUESTS
        this.discovery_request.set(object.discovery_request);
        this.authorization_request.set(object.authorization_request);
        this.token_request.set(object.token_request);
        this.verification_request.set(object.verification_request);
        this.revocation_request.set(object.revocation_request);
        // RESPONSES
        this.configuration_response.set(object.configuration_response);
        this.discovery_response.set(object.discovery_response);
        this.authorization_response.set(object.authorization_response);
        this.token_response.set(object.token_response);
        this.verification_response.set(object.verification_response);
        this.revocation_response.set(object.revocation_response);
        // OPENED DATA
        this.configuration_open.set(object.configuration_open);
        this.discovery_open.set(object.discovery_open);
        this.authorization_open.set(object.authorization_open);
        this.token_open.set(object.token_open);
        this.verification_open.set(object.verification_open);
        this.revocation_open.set(object.revocation_open);
        // ERRORS
        this.configuration_error.set(object.configuration_error);
        this.discovery_error.set(object.discovery_error);
        this.authorization_error.set(object.authorization_error);
        this.token_error.set(object.token_error);
        this.verification_error.set(object.verification_error);
        this.revocation_error.set(object.revocation_error);
        // TEXT MODIFIED
        this.textModified.set(object.textModified);
    }
}

import { LoginComponent } from "./login.component";

export function saveParameters(this: LoginComponent ) {
    // AUTHORIZATION SERVER CREDENTIALS
    const api = this.api();
    // CONFIGURATION
    const authorization_grant = this.authorization_grant();
    const no_discovery = this.no_discovery();
    const no_pkce = this.no_pkce();
    const no_state = this.no_state();
    const no_nonce = this.no_nonce();
    // AUTHORIZATION -> CREDENTIALS-DEPENDENT
    const access_type = this.access_type();
    const include_granted_scopes = this.include_granted_scopes();
    const enable_granular_consent = this.enable_granular_consent();
    // METADATA -> CREDENTIALS-DEPENDENT
    const issuer = this.issuer();
    // PARAMETERS -> CREDENTIALS-DEPENDENT
    const client_id = this.client_id();
    const client_secret = this.client_secret();
    // PARAMETERS -> REDIRECT_URI
    const redirect_uri = this.redirect_uri();
    // PARAMETERS -> RESPONSE_TYPE
    const code = this.code();
    const token = this.token();
    const id_token = this.id_token();
    const none = this.none();
    // PARAMETERS -> SCOPE
    const openid = this.openid();
    const email = this.email();
    const profile = this.profile();
    const api_scope = this.api_scope();
    // RESPONSES
    const configuration_response = this.configuration_response();
    const discovery_response = this.discovery_response();
    const authorization_response = this.authorization_response();
    const token_response = this.token_response();
    const verification_response = this.verification_response();
    const revocation_response = this.revocation_response();
    // OPENED DATA
    const configuration_open = this.configuration_open();
    const discovery_open = this.discovery_open();
    const authorization_open = this.authorization_open();
    const token_open = this.token_open();
    const verification_open = this.verification_open();
    const revocation_open = this.revocation_open();
    // ERRORS
    const configuration_error = this.configuration_error();
    const discovery_error = this.discovery_error();
    const authorization_error = this.authorization_error();
    const token_error = this.token_error();
    const verification_error = this.verification_error();
    const revocation_error = this.revocation_error();
    // TEXT MODIFIED
    const textModified = this.textModified();

    sessionStorage.setItem(
        "pr",
        JSON.stringify({
            // AUTHORIZATION SERVER CREDENTIALS
            api,
            // CONFIGURATION
            authorization_grant,
            no_discovery,
            no_pkce,
            no_state,
            no_nonce,
            // AUTHORIZATION -> CREDENTIALS-DEPENDENT
            access_type,
            include_granted_scopes,
            enable_granular_consent,
            // METADATA -> CREDENTIALS-DEPENDENT
            issuer,
            // PARAMETERS -> CREDENTIALS-DEPENDENT
            client_id,
            client_secret,
            // PARAMETERS -> RESPONSE_TYPE
            code,
            token,
            id_token,
            none,
            // PARAMETERS -> REDIRECT_URI
            redirect_uri,
            // PARAMETERS -> SCOPE
            openid,
            email,
            profile,
            api_scope,
            // RESPONSES
            configuration_response,
            discovery_response,
            authorization_response,
            token_response,
            verification_response,
            revocation_response,
            // OPENED DATA
            configuration_open,
            discovery_open,
            authorization_open,
            token_open,
            verification_open,
            revocation_open,
            // ERRORS
            configuration_error,
            discovery_error,
            authorization_error,
            token_error,
            verification_error,
            revocation_error,
            // TEXT MODIFIED
            textModified,
        })
    );
}

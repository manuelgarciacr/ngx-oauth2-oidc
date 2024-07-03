import { LoginComponent } from "./login.component";

export function saveParameters(this: LoginComponent ) {
    const api = this.api();
    const client_id = this.client_id();
    const client_secret = this.client_secret();
    // CONFIGURATION -> AUTHORIZATION_GRANT
    const authorization_grant = this.authorization_grant();
    // CONFIGURATION -> OPTIONS
    const no_discovery = this.no_discovery();
    const no_pkce = this.no_pkce();
    const no_state = this.no_state();
    const no_nonce = this.no_nonce();
    // AUTHORIZATION -> CUSTOM GOOGLE PARAMETERS
    const access_type = this.access_type();
    const include_granted_scopes = this.include_granted_scopes();
    const enable_granular_consent = this.enable_granular_consent();
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
    const authorization_response = this.authorization_response();
    const discovery_response = this.discovery_response();
    const token_response = this.token_response();
    const verification_response = this.verification_response();
    // TEXT MODIFIED
    const textModified = this.textModified();
console.log("save")
    sessionStorage.setItem(
        "pr",
        JSON.stringify({
            api,
            client_id,
            client_secret,
            // CONFIGURATION -> AUTHORIZATION_GRANT
            authorization_grant,
            // CONFIGURATION -> OPTIONS
            no_discovery,
            no_pkce,
            no_state,
            no_nonce,
            // AUTHORIZATION -> CUSTOM GOOGLE PARAMETERS
            access_type,
            include_granted_scopes,
            enable_granular_consent,
            // PARAMETERS -> RESPONSE_TYPE
            code,
            token,
            id_token,
            none,
            // PARAMETERS -> SCOPE
            openid,
            email,
            profile,
            api_scope,
            // RESPONSES
            configuration_response,
            authorization_response,
            discovery_response,
            token_response,
            verification_response,
            // TEXT MODIFIED
            textModified,
        })
    );
}

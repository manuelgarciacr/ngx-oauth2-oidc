/** Metadata object */
declare const metadata: {
    acr_values_supported: string[];
    authorization_details_types_supported: string[];
    authorization_endpoint: string;
    authorization_response_iss_parameter_supported: boolean;
    backchannel_authentication_endpoint: string;
    backchannel_authentication_request_signing_alg_values_supported: string[];
    backchannel_logout_session_supported: boolean;
    backchannel_logout_supported: boolean;
    backchannel_token_delivery_modes_supported: string[];
    backchannel_user_code_parameter_supported: boolean;
    check_session_iframe: string;
    claim_types_supported: string[];
    claims_locales_supported: string[];
    claims_parameter_supported: boolean;
    claims_supported: string[];
    code_challenge_methods_supported: string[];
    device_authorization_endpoint: string;
    display_values_supported: string[];
    dpop_signing_alg_values_supported: string[];
    end_session_endpoint: string;
    frontchannel_logout_supported: boolean;
    grant_types_supported: string[];
    id_token_encryption_alg_values_supported: string[];
    id_token_encryption_enc_values_supported: string[];
    id_token_signing_alg_values_supported: string[];
    introspection_encryption_alg_values_supported: string[];
    introspection_encryption_enc_values_supported: string[];
    introspection_endpoint: string;
    introspection_endpoint_auth_methods_supported: string[];
    introspection_endpoint_auth_signing_alg_values_supported: string[];
    introspection_signing_alg_values_supported: string[];
    issuer: string;
    jwks_uri: string;
    mtls_endpoint_aliases: string[];
    nfv_token_encryption_alg_values_supported: string[];
    nfv_token_encryption_enc_values_supported: string[];
    nfv_token_signing_alg_values_supported: string[];
    op_policy_uri: string;
    op_tos_uri: string;
    pushed_authorization_request_endpoint: string;
    registration_endpoint: string;
    request_object_encryption_alg_values_supported: string[];
    request_object_encryption_enc_values_supported: string[];
    request_object_signing_alg_values_supported: string[];
    request_parameter_supported: boolean;
    request_uri_parameter_supported: boolean;
    require_pushed_authorization_requests: boolean;
    require_request_uri_registration: boolean;
    require_signed_request_object: boolean;
    response_modes_supported: string[];
    response_types_supported: string[];
    revocation_endpoint: string;
    revocation_endpoint_auth_methods_supported: string[];
    revocation_endpoint_auth_signing_alg_values_supported: string[];
    scopes_supported: string[];
    service_documentation: string;
    signed_metadata: string;
    subject_types_supported: string[];
    tls_client_certificate_bound_access_tokens: boolean;
    token_endpoint: string;
    token_endpoint_auth_methods_supported: string[];
    token_endpoint_auth_signing_alg_values_supported: string[];
    ui_locales_supported: string[];
    userinfo_encryption_alg_values_supported: string[];
    userinfo_encryption_enc_values_supported: string[];
    userinfo_endpoint: string;
    userinfo_signing_alg_values_supported: string[];
};
/** Metadata section type */
export interface IOAuth2Metadata extends Partial<typeof metadata> {
}
/** Metadata names */
export declare const metadataNames: string[];
export {};
//# sourceMappingURL=IOAuth2Metadata.d.ts.map
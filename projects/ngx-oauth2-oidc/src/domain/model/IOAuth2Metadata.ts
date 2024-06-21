import { urlType } from "../index";

/** Metadata object */
const metadata = {
    acr_values_supported: [] as string[], // JSON array containing a list of the Authentication Context Class References that this OP supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    authorization_details_types_supported: [] as string[], // JSON array containing the authorization details types the AS supports	IETF	[RFC9396, Section 10]
    authorization_endpoint: "" as urlType, // URL of the authorization server's authorization endpoint	IESG	[RFC8414, Section 2]
    authorization_response_iss_parameter_supported: false, // Boolean value indicating whether the authorization server provides the iss parameter in the authorization response.	IETF	[RFC9207, Section 3]
    backchannel_authentication_endpoint: "" as urlType, // CIBA Backchannel Authentication Endpoint	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    backchannel_authentication_request_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS signing algorithms supported for validation of signed CIBA authentication requests	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    backchannel_logout_session_supported: false, // Boolean value specifying whether the OP can pass a sid (session ID) Claim in the Logout Token to identify the RP session with the OP	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Back-Channel Logout 1.0, Section 2]
    backchannel_logout_supported: false, // Boolean value specifying whether the OP supports back-channel logout, with true indicating support	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Back-Channel Logout 1.0, Section 2]
    backchannel_token_delivery_modes_supported: [] as string[], // Supported CIBA authentication result delivery modes	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    backchannel_user_code_parameter_supported: false, // Indicates whether the OP supports the use of the CIBA user_code parameter.	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    check_session_iframe: "" as urlType, // URL of an OP iframe that supports cross-origin communications for session state information with the RP Client, using the HTML5 postMessage API	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Session Management 1.0, Section 3.3]
    claim_types_supported: [] as string[], // JSON array containing a list of the Claim Types that the OpenID Provider supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    claims_locales_supported: [] as string[], // Languages and scripts supported for values in Claims being returned, represented as a JSON array of BCP 47 [RFC5646] language tag values	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    claims_parameter_supported: false, // Boolean value specifying whether the OP supports use of the "claims" parameter	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    claims_supported: [] as string[], // JSON array containing a list of the Claim Names of the Claims that the OpenID Provider MAY be able to supply values for	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    code_challenge_methods_supported: [] as string[], // PKCE code challenge methods supported by this authorization server	IESG	[RFC8414, Section 2]
    device_authorization_endpoint: "" as urlType, // URL of the authorization server's device authorization endpoint	IESG	[RFC8628, Section 4]
    display_values_supported: [] as string[], // JSON array containing a list of the "display" parameter values that the OpenID Provider supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    dpop_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS algorithms supported for DPoP proof JWTs	IETF	[RFC9449, Section 5.1]
    end_session_endpoint: "" as urlType, // URL at the OP to which an RP can perform a redirect to request that the End-User be logged out at the OP	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect RP-Initiated Logout 1.0, Section 2.1]
    frontchannel_logout_supported: false, // Boolean value specifying whether the OP supports HTTP-based logout, with true indicating support	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Front-Channel Logout 1.0, Section 3]
    grant_types_supported: [] as string[], // JSON array containing a list of the OAuth 2.0 grant type values that this authorization server supports	IESG	[RFC8414, Section 2]
    id_token_encryption_alg_values_supported: [] as string[], // JSON array containing a list of the JWE "alg" values supported by the OP for the ID Token	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    id_token_encryption_enc_values_supported: [] as string[], // JSON array containing a list of the JWE "enc" values supported by the OP for the ID Token	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    id_token_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS "alg" values supported by the OP for the ID Token	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    introspection_encryption_alg_values_supported: [] as string[], // JSON array containing a list of algorithms supported by the authorization server for introspection response content key encryption (alg value).	IETF	[RFC-ietf-oauth-jwt-introspection-response-12, Section 7]
    introspection_encryption_enc_values_supported: [] as string[], // JSON array containing a list of algorithms supported by the authorization server for introspection response content encryption (enc value).	IETF	[RFC-ietf-oauth-jwt-introspection-response-12, Section 7]
    introspection_endpoint: "" as urlType, // URL of the authorization server's OAuth 2.0 introspection endpoint	IESG	[RFC8414, Section 2]
    introspection_endpoint_auth_methods_supported: [] as string[], // JSON array containing a list of client authentication methods supported by this introspection endpoint	IESG	[RFC8414, Section 2]
    introspection_endpoint_auth_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS signing algorithms supported by the introspection endpoint for the signature on the JWT used to authenticate the client at the introspection endpoint	IESG	[RFC8414, Section 2]
    introspection_signing_alg_values_supported: [] as string[], // JSON array containing a list of algorithms supported by the authorization server for introspection response signing.	IETF	[RFC-ietf-oauth-jwt-introspection-response-12, Section 7]
    issuer: "", // Authorization server's issuer identifier URL	IESG	[RFC8414, Section 2]
    jwks_uri: "" as urlType, // URL of the authorization server's JWK Set document	IESG	[RFC8414, Section 2]
    mtls_endpoint_aliases: [] as string[], // JSON object containing alternative authorization server endpoints, which a client intending to do mutual TLS will use in preference to the conventional endpoints.	IESG	[RFC8705, Section 5]
    nfv_token_encryption_alg_values_supported: [] as string[], // JSON array containing a list of the JWE encryption algorithms (alg values) supported by the server to encode the JWT used as NFV Token	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nfv_token_encryption_enc_values_supported: [] as string[], // JSON array containing a list of the JWE encryption algorithms (enc values) supported by the server to encode the JWT used as NFV Token	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nfv_token_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS signing algorithms supported by the server for signing the JWT used as NFV Token	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    op_policy_uri: "" as urlType, // URL that the authorization server provides to the person registering the client to read about the authorization server's requirements on how the client can use the data provided by the authorization server	IESG	[RFC8414, Section 2]
    op_tos_uri: "" as urlType, // URL that the authorization server provides to the person registering the client to read about the authorization server's terms of service	IESG	[RFC8414, Section 2]
    pushed_authorization_request_endpoint: "" as urlType, // URL of the authorization server's pushed authorization request endpoint	IESG	[RFC9126, Section 5]
    registration_endpoint: "" as urlType, // URL of the authorization server's OAuth 2.0 Dynamic Client Registration Endpoint	IESG	[RFC8414, Section 2]
    request_object_encryption_alg_values_supported: [] as string[], // JSON array containing a list of the JWE "alg" values supported by the OP for Request Objects	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_object_encryption_enc_values_supported: [] as string[], // JSON array containing a list of the JWE "enc" values supported by the OP for Request Objects	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_object_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS "alg" values supported by the OP for Request Objects	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_parameter_supported: false, // Boolean value specifying whether the OP supports use of the "request" parameter	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_uri_parameter_supported: false, // Boolean value specifying whether the OP supports use of the "request_uri" parameter	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    require_pushed_authorization_requests: false, // Indicates whether the authorization server accepts authorization requests only via PAR.	IESG	[RFC9126, Section 5]
    require_request_uri_registration: false, // Boolean value specifying whether the OP requires any "request_uri" values used to be pre-registered	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    require_signed_request_object: false, // Indicates where authorization request needs to be protected as Request Object and provided through either request or request_uri parameter.	IETF	[RFC9101, Section 10.5]
    response_modes_supported: [] as string[], // JSON array containing a list of the OAuth 2.0 "response_mode" values that this authorization server supports	IESG	[RFC8414, Section 2]
    response_types_supported: [] as string[], // JSON array containing a list of the OAuth 2.0 "response_type" values that this authorization server supports	IESG	[RFC8414, Section 2]
    revocation_endpoint: "" as urlType, // URL of the authorization server's OAuth 2.0 revocation endpoint	IESG	[RFC8414, Section 2]
    revocation_endpoint_auth_methods_supported: [] as string[], // JSON array containing a list of client authentication methods supported by this revocation endpoint	IESG	[RFC8414, Section 2]
    revocation_endpoint_auth_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS signing algorithms supported by the revocation endpoint for the signature on the JWT used to authenticate the client at the revocation endpoint	IESG	[RFC8414, Section 2]
    scopes_supported: [] as string[], // JSON array containing a list of the OAuth 2.0 "scope" values that this authorization server supports	IESG	[RFC8414, Section 2]
    service_documentation: "" as urlType, // URL of a page containing human-readable information that developers might want or need to know when using the authorization server	IESG	[RFC8414, Section 2]
    signed_metadata: "", // Signed JWT containing metadata values about the authorization server as claims	IESG	[RFC8414, Section 2.1]
    subject_types_supported: [] as string[], // JSON array containing a list of the Subject Identifier types that this OP supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    tls_client_certificate_bound_access_tokens: false, // Indicates authorization server support for mutual-TLS client certificate-bound access tokens.	IESG	[RFC8705, Section 3.3]
    token_endpoint: "" as urlType, // URL of the authorization server's token endpoint	IESG	[RFC8414, Section 2]
    token_endpoint_auth_methods_supported: [] as string[], // JSON array containing a list of client authentication methods supported by this token endpoint	IESG	[RFC8414, Section 2]
    token_endpoint_auth_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS signing algorithms supported by the token endpoint for the signature on the JWT used to authenticate the client at the token endpoint	IESG	[RFC8414, Section 2]
    ui_locales_supported: [] as string[], // Languages and scripts supported for the user interface, represented as a JSON array of language tag values from BCP 47 [RFC5646]	IESG	[RFC8414, Section 2]
    userinfo_encryption_alg_values_supported: [] as string[], // JSON array containing a list of the JWE "alg" values supported by the UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    userinfo_encryption_enc_values_supported: [] as string[], // JSON array containing a list of the JWE "enc" values supported by the UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    userinfo_endpoint: "" as urlType, // URL of the OP's UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    userinfo_signing_alg_values_supported: [] as string[], // JSON array containing a list of the JWS "alg" values supported by the UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
}

/** Metadata section type */
export interface IOAuth2Metadata extends Partial<typeof metadata> {};

/** Metadata names */
export const metadataNames = Object.keys(
    metadata
);

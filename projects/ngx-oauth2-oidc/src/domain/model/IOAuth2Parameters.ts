import { urlType } from "./IOAuth2Config";

// jose JWTVerifyOptions
export interface IOAUth2VerifyToken {
    algorithms?: string[]; // JWT Header "alg"
    clockTolerance?: string | number;
    crit?: { [key: string]: boolean };
    currentDate?: Date;
    id_token?: string; // JWT
    id_token_verification_audience?: string | string[]; // JWT "aud" claim. Parm: "client_id"
        client_id?: string; // Default value for "audience"
    issuer?: string | string[]; // JWT "iss" claim. Meta: "issuer"
    maxTokenAge?: string | number; // JWT "iat" claim tolerance
    requiredClaims?: string[];
    subject?: string; // JWT "sub" claim. Resource provider internal user ID.
    typ?: string; // JWT Header "typ"
}

export interface IOAuth2Parameters extends IOAUth2VerifyToken{
    access_token?: string; // authorization response, token response	IETF	[RFC6749]
    ace_client_recipientid?: unknown; // client-rs request	IETF	[RFC9203]
    ace_profile?: unknown; // token response IETF	[RFC9200, Sections 5.8.2, 5.8.4.3]
    ace_server_recipientid?: unknown; // rs-client response	IETF	[RFC9203]
    acr_values?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    actor_token?: unknown; // token request	IESG	[RFC8693, Section 2.1]
    actor_token_type?: unknown; // token request	IESG	[RFC8693, Section 2.1]
    assertion?: unknown; // token request	IESG	[RFC7521]
    aud?: unknown; // authorization request	IETF	[RFC7519, Section 4.1.3][RFC9101]
    audience?: unknown; // token request	IESG	[RFC8693, Section 2.1]
    authorization_details?: unknown; // authorization request, token request, token response	IETF	[RFC9396]
    claim_token?: unknown; // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    claims?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    claims_locales?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    client_assertion?: unknown; // token request	IESG	[RFC7521]
    client_assertion_type?: unknown; // token request	IESG	[RFC7521]
    client_id?: string; // authorization request, token request	IETF	[RFC6749]
    client_secret?: string; // token request	IETF	[RFC6749]
    cnf?: unknown; // token response	IETF	[RFC9201, Section 5]
    code?: string; // authorization response, token request	IETF	[RFC6749]  The code is always empty, it should never be stored. If needed, the service gets its value as a parameter.
    code_challenge?: string; // authorization request	IESG	[RFC7636]
    code_challenge_method?: "S256" | "plain"; // authorization request	IESG	[RFC7636]
    code_verifier?: string; // token request	IESG	[RFC7636]
    device_code?: unknown; // token request	IESG	[RFC8628, Section 3.1]
    display?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    dpop_jkt?: unknown; // authorization request	IETF	[RFC9449, Section 10]
    error?: string; // authorization response, token response	IETF	[RFC6749]
    error_description?: string; // authorization response, token response	IETF	[RFC6749]
    error_uri?: string; // authorization response, token response	IETF	[RFC6749]
    exp?: unknown; // authorization request	IETF	[RFC7519, Section 4.1.4][RFC9101]
    expires_in?: number; // authorization response, token response	IETF	[RFC6749]
    grant_type?: string; // token request	IETF	[RFC6749]
    iat?: unknown; // authorization request	IETF	[RFC7519, Section 4.1.6][RFC9101]
    id_token?: string; // authorization response, access token response	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    id_token_hint?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    iss?: unknown; // authorization request, authorization response	IETF	[RFC9207, Section 2][RFC9101][RFC7519, Section 4.1.1]
    issued_token_type?: unknown; // token response	IESG	[RFC8693, Section 2.2.1]
    jti?: unknown; // authorization request	IETF	[RFC7519, Section 4.1.7][RFC9101]
    kdcchallenge?: unknown; // rs-client response	IETF	[RFC-ietf-ace-key-groupcomm-18]
    login_hint?: string; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    max_age?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    nbf?: unknown; // authorization request	IETF	[RFC7519, Section 4.1.5][RFC9101]
    nfv_token?: unknown; // Access Token Response	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nonce?: string; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    nonce1?: unknown; // client-rs request	IETF	[RFC9203]
    nonce2?: unknown; // rs-client response	IETF	[RFC9203]
    password?: unknown; // token request	IETF	[RFC6749]
    pct?: unknown; // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    // pct	authorization server response, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.5]
    prompt?: string[]; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    redirect_uri?: urlType; // authorization request, token request	IETF	[RFC6749]
    refresh_token?: string; // token request, token response	IETF	[RFC6749]
    registration?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    req_cnf?: unknown; // token request	IETF	[RFC9201, Section 5]
    request?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    request_uri?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    requested_token_type?: unknown; // token request	IESG	[RFC8693, Section 2.1]
    resource?: unknown; // authorization request, token request	IESG	[RFC8707]
    response_mode?: unknown; // Authorization Request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OAuth 2.0 Multiple Response Type Encoding Practices]
    response_type?: string[]; // authorization request	IETF	[RFC6749]
    rpt?: unknown; // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    rs_cnf?: unknown; // token response	IETF	[RFC9201, Section 5]
    scope?: string[]; // authorization request, authorization response, token request, token response	IETF	[RFC6749]
    session_state?: unknown; // authorization response, access token response	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Session Management 1.0, Section 2]
    sign_info?: unknown; // client-rs request, rs-client response	IETF	[RFC-ietf-ace-key-groupcomm-18]
    state?: string; // authorization request, authorization response	IETF	[RFC6749]
    sub?: unknown; // authorization request	IETF	[RFC7519, Section 4.1.2][RFC9101]
    subject_token?: unknown; // token request	IESG	[RFC8693, Section 2.1]
    subject_token_type?: unknown; // token request	IESG	[RFC8693, Section 2.1]
    ticket?: unknown; // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    token_type?: string; // authorization response, token response	IETF	[RFC6749]
    token_type_hint?: "access_token" | "refresh_token"; // token revocation
    ui_locales?: unknown; // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    upgraded?: unknown; // authorization server response, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.5]
    username?: unknown; // token request	IETF	[RFC6749]
    vtr?: unknown; // authorization request, token request	IESG	[RFC8485]
}

export const endpointParameters = {
    authorization: [
        "acr_values",
        "aud",
        "authorization_details",
        "claims",
        "claims_locales",
        "client_id",
        "code_challenge",
        "code_challenge_method",
        "display",
        "dpop_jkt",
        "exp",
        "iat",
        "id_token_hint",
        "iss",
        "jti",
        "login_hint",
        "max_age",
        "nbf",
        "nonce",
        "prompt",
        "redirect_uri",
        "registration",
        "request",
        "request_uri",
        "resource",
        "response_mode",
        "response_type",
        "scope",
        "state",
        "sub",
        "ui_locales",
        "vtr",
    ],
    token: [
        "actor_token",
        "actor_token_type",
        "assertion",
        "audience",
        "authorization_details",
        "client_assertion",
        "client_assertion_type",
        "client_id",
        "client_secret",
        "code",
        "code_verifier",
        "device_code",
        "grant_type",
        "password",
        "redirect_uri",
        "refresh_token",
        "req_cnf",
        "requested_token_type",
        "resource",
        "scope",
        "subject_token",
        "subject_token_type",
        "username",
        "vtr",
    ],
    //refresh: ["grant_type", "refresh_token", "scope"],
    revocation: ["token_type_hint", "access_token", "refresh_token"],
    verify_token: [
        "algorithms",
        "clockTolerance",
        "crit",
        "currentDate",
        "id_token",
        "id_token_verification_audience",
            "client_id",
        "issuer",
        "maxTokenAge",
        "requiredClaims",
        "subject",
        "typ"
    ]
};

export const endpointNames = Object.keys(endpointParameters) as (keyof typeof endpointParameters)[];

// export type authorization_response_parameter = "access_token" | "code" | "error"
//     | "error_description" | "error_uri" | "expires_in" | "id_token" | "iss" | "scope"
//     | "session_state" | "state" | "token_type";

// export type token_response_parameter = "access_token" | "ace_profile" | "authorization_details"
//     | "cnf" | "error" | "error_description" | "error_uri" | "expires_in" | "id_token"
//     | "issued_token_type" | "nfv_token" | "refresh_token" | "rs_cnf" | "scope" | "session_state"
//     | "token_type";

export const string_array_parameter = ["prompt", "scope"] as const;
export const url_parameter = ["redirect_uri"] as const;
export const number_parameter = ["expires_in"] as const;

import {  urlType } from "../index";

/** Discovery endpoint parameter names */
const discoveryParameters = [] as string[];

/** Authorization endpoint parameter names */
const authorizationParameters = [
    'acr_values',
    'aud',
    'authorization_details',
    'claims',
    'claims_locales',
    'client_id',
    'code_challenge',
    'code_challenge_method',
    'display',
    'dpop_jkt',
    'exp',
    'iat',
    'id_token_hint',
    'iss',
    'jti',
    'login_hint',
    'max_age',
    'nbf',
    'nonce',
    'prompt',
    'redirect_uri',
    'registration',
    'request',
    'request_uri',
    'resource',
    'response_mode',
    'response_type',
    'scope',
    'state',
    'sub',
    'ui_locales',
    'vtr'
];

/** Token endpoint parameter names */
const tokenParameters = [
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
    "subject_token",
    "subject_token_type",
    "username",
    "vtr"
];

/** Verify token method parameter names */
const verifyTokenParameters = [
    'id_token', 'client_id', 'nonce'
];

/** Revocation endpoint parameter names */
const revocationParameters = [
    'token_type_hint', 'access_token','refresh_token'
];

/** OAuth2Parameters object */
const parameters = {
    access_token: "", // authorization response, token response	IETF	[RFC6749]
    ace_client_recipientid: undefined as unknown, // client-rs request	IETF	[RFC9203]
    ace_profile: undefined as unknown, // token response IETF	[RFC9200, Sections 5.8.2, 5.8.4.3]
    ace_server_recipientid: undefined as unknown, // rs-client response	IETF	[RFC9203]
    acr_values: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    actor_token: "", // token request	IESG	[RFC8693, Section 2.1]
    actor_token_type: "", // token request	IESG	[RFC8693, Section 2.1]
    assertion: "", // token request	IESG	[RFC7521]
    aud: "", // authorization request	IETF	[RFC7519, Section 4.1.3][RFC9101]
    audience: "", // token request	IESG	[RFC8693, Section 2.1]
    authorization_details: "", // authorization request, token request, token response	IETF	[RFC9396]
    claim_token: undefined as unknown, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    claims: "{}", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    claims_locales: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    client_assertion: "", // token request	IESG	[RFC7521]
    client_assertion_type: "", // token request	IESG	[RFC7521]
    client_id: "", // authorization request, token request	IETF	[RFC6749]
    client_secret: "", // token request	IETF	[RFC6749]
    cnf: undefined as unknown, // token response	IETF	[RFC9201, Section 5]
    code: "", // authorization response, token request	IETF	[RFC6749]  The code is always empty, it should never be stored. If needed, the service gets its value as a parameter.
    code_challenge: "", // authorization request	IESG	[RFC7636]
    code_challenge_method: "" as "S256" | "plain", // authorization request	IESG	[RFC7636]
    code_verifier: "", // token request	IESG	[RFC7636]
    device_code: "", // token request	IESG	[RFC8628, Section 3.1]
    display: "" as "page" | "popup" | "touch" | "wap", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    dpop_jkt: "", // authorization request	IETF	[RFC9449, Section 10]
    error: "", // authorization response, token response	IETF	[RFC6749]
    error_description: "", // authorization response, token response	IETF	[RFC6749]
    error_uri: "", // authorization response, token response	IETF	[RFC6749]
    exp: "", // authorization request	IETF	[RFC7519, Section 4.1.4][RFC9101]
    expires_in: 0 as number, // authorization response, token response	IETF	[RFC6749]
    grant_type: "", // token request	IETF	[RFC6749]
    iat: "", // authorization request	IETF	[RFC7519, Section 4.1.6][RFC9101]
    id_token: "", // authorization response, access token response	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    id_token_hint: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    iss: "", // authorization request, authorization response	IETF	[RFC9207, Section 2][RFC9101][RFC7519, Section 4.1.1]
    issued_token_type: undefined as unknown, // token response	IESG	[RFC8693, Section 2.2.1]
    jti: "", // authorization request	IETF	[RFC7519, Section 4.1.7][RFC9101]
    kdcchallenge: undefined as unknown, // rs-client response	IETF	[RFC-ietf-ace-key-groupcomm-18]
    login_hint: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    max_age: 0 as number, // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    nbf: "", // authorization request	IETF	[RFC7519, Section 4.1.5][RFC9101]
    nfv_token: undefined as unknown, // Access Token Response	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nonce: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    nonce1: undefined as unknown, // client-rs request	IETF	[RFC9203]
    nonce2: undefined as unknown, // rs-client response	IETF	[RFC9203]
    password: "", // token request	IETF	[RFC6749]
    pct: undefined as unknown, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    // pct	authorization server response, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.5]
    prompt: [] as "none"[] | ("login" | "consent" | "select_account")[], // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    redirect_uri: "" as urlType, // authorization request, token request	IETF	[RFC6749]
    refresh_token: "", // token request, token response	IETF	[RFC6749]
    registration: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    req_cnf: "", // token request	IETF	[RFC9201, Section 5]
    request: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    request_uri: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    requested_token_type: "", // token request	IESG	[RFC8693, Section 2.1]
    resource: "", // authorization request, token request	IESG	[RFC8707]
    response_mode: "" as "query" | "fragment", // Authorization Request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OAuth 2.0 Multiple Response Type Encoding Practices]
    response_type: [] as string[], // authorization request	IETF	[RFC6749]
    rpt: undefined as unknown, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    rs_cnf: undefined as unknown, // token response	IETF	[RFC9201, Section 5]
    scope: [] as string[], // authorization request, authorization response, token request ???????, token response	IETF	[RFC6749]
    session_state: undefined as unknown, // authorization response, access token response	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Session Management 1.0, Section 2]
    sign_info: undefined as unknown, // client-rs request, rs-client response	IETF	[RFC-ietf-ace-key-groupcomm-18]
    state: "", // authorization request, authorization response	IETF	[RFC6749]
    sub: "", // authorization request	IETF	[RFC7519, Section 4.1.2][RFC9101]
    subject_token: "", // token request	IESG	[RFC8693, Section 2.1]
    subject_token_type: "", // token request	IESG	[RFC8693, Section 2.1]
    ticket: undefined as unknown, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    token_type: "", // authorization response, token response	IETF	[RFC6749]
    // Proposed standard token revocation endpoint
    token_type_hint: "" as "access_token" | "refresh_token" | "pct", // token revocation
    ui_locales: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    upgraded: undefined as unknown, // authorization server response, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.5]
    username: "", // token request	IETF	[RFC6749]
    vtr: "", // authorization request, token request	IESG	[RFC8485]
}

/** Verify token method parameters object */
const verifyTokenJoseOptions = {
    algorithms: [] as string[],
    audience: "" as string | string[],
    clockTolerance: "" as string | number,
    crit: {} as { [key: string]: boolean },
    currentDate: new Date(),
    issuer: "" as string | string[],
    maxTokenAge: "" as string | number,
    requiredClaims: [] as string[],
    subject: "",
    typ: "",
};

/** Parameters section type */
export interface IOAuth2Parameters
    extends Partial<typeof parameters> {};

/** Authorization endpoint parameters object type */
export interface IOAuth2AuthorizationParameters
    extends Partial<typeof authorizationParameters> {};

/** Token endpoint parameters object type */
export interface IOAuth2TokenParameters
    extends Partial<typeof tokenParameters> {};

/** Verify token method parameters object type */
export interface IOAuth2VerifyTokenParameters
    extends Partial<typeof verifyTokenParameters> {};

/** Verify token method jose options object type */
export interface IOAuth2VerifyTokenJoseOptions
    extends Partial<typeof verifyTokenJoseOptions> {};

/** Revocation endpoint parameters object type */
export interface IOAuth2RevocationParameters
    extends Partial<typeof revocationParameters> {};

/** Get endpoint custom parameter type */
export const getType = (name: keyof IOAuth2Parameters) => {
    const value = parameters[name];
    return Array.isArray(value)
        ? "array"
        : value == "{}"
        ? "json"
        : typeof value;
};

/** Parameter names */
export const parameterNames = {
    discovery: discoveryParameters,
    authorization: authorizationParameters,
    token: tokenParameters,
    refresh: tokenParameters,
    revocation: revocationParameters,
    verify_token: verifyTokenParameters,
    all: Object.keys(parameters),
};

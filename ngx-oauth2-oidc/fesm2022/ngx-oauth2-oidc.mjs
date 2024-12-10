import { HttpHeaders, HttpParams, HttpRequest, HttpErrorResponse, HttpClient } from '@angular/common/http';
import * as i0 from '@angular/core';
import { InjectionToken, inject, Injectable, Inject, makeEnvironmentProviders } from '@angular/core';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { lastValueFrom, map, catchError } from 'rxjs';
import pkceChallenge, { generateChallenge } from 'pkce-challenge';
import { JOSEError } from 'jose/errors';
import { Router } from '@angular/router';

/**
 * Sets/removes an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @param value New value. If null or empty string, the item is removed.
 */
const setStore = (name, value = null) => {
    const sto = sessionStorage;
    const val = JSON.parse(JSON.stringify(value));
    if (name == "config" && !!value) {
        delete val?.parameters?.id_token;
        delete val?.parameters?.access_token;
        delete val?.parameters?.refresh_token;
        delete val?.parameters?.code;
        delete val?.parameters?.client_secret;
        delete val?.parameters?.code_challenge;
    }
    name = `oauth2_${name}`;
    if (val == null || val === "")
        sto.removeItem(name);
    else
        sto.setItem(name, JSON.stringify(val));
};
/**
 * Gets an oauth2 session storage item
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
const getStore = (name) => {
    const sto = sessionStorage;
    name = `oauth2_${name}`;
    return sto.getItem(name);
};
/**
 * Gets an oauth2 session storage item as an object type
 *
 * @param name Name of the session storage key. Internally is prefixed by "oauth2_"
 * @returns The stored value
 */
const getStoreObject = (name) => {
    const str = getStore(name);
    return str ? JSON.parse(str) : null;
};

/** Discovery endpoint parameter names */
const discoveryParameters = [];
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
    'token_type_hint', 'access_token', 'refresh_token'
];
/** OAuth2Parameters object */
const parameters = {
    access_token: "", // authorization response, token response	IETF	[RFC6749]
    ace_client_recipientid: undefined, // client-rs request	IETF	[RFC9203]
    ace_profile: undefined, // token response IETF	[RFC9200, Sections 5.8.2, 5.8.4.3]
    ace_server_recipientid: undefined, // rs-client response	IETF	[RFC9203]
    acr_values: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    actor_token: "", // token request	IESG	[RFC8693, Section 2.1]
    actor_token_type: "", // token request	IESG	[RFC8693, Section 2.1]
    assertion: "", // token request	IESG	[RFC7521]
    aud: "", // authorization request	IETF	[RFC7519, Section 4.1.3][RFC9101]
    audience: "", // token request	IESG	[RFC8693, Section 2.1]
    authorization_details: "", // authorization request, token request, token response	IETF	[RFC9396]
    claim_token: undefined, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    claims: "{}", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    claims_locales: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    client_assertion: "", // token request	IESG	[RFC7521]
    client_assertion_type: "", // token request	IESG	[RFC7521]
    client_id: "", // authorization request, token request	IETF	[RFC6749]
    client_secret: "", // token request	IETF	[RFC6749]
    cnf: undefined, // token response	IETF	[RFC9201, Section 5]
    code: "", // authorization response, token request	IETF	[RFC6749]  The code is always empty, it should never be stored. If needed, the service gets its value as a parameter.
    code_challenge: "", // authorization request	IESG	[RFC7636]
    code_challenge_method: "", // authorization request	IESG	[RFC7636]
    code_verifier: "", // token request	IESG	[RFC7636]
    device_code: "", // token request	IESG	[RFC8628, Section 3.1]
    display: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    dpop_jkt: "", // authorization request	IETF	[RFC9449, Section 10]
    error: "", // authorization response, token response	IETF	[RFC6749]
    error_description: "", // authorization response, token response	IETF	[RFC6749]
    error_uri: "", // authorization response, token response	IETF	[RFC6749]
    exp: "", // authorization request	IETF	[RFC7519, Section 4.1.4][RFC9101]
    expires_in: 0, // authorization response, token response	IETF	[RFC6749]
    grant_type: "", // token request	IETF	[RFC6749]
    iat: "", // authorization request	IETF	[RFC7519, Section 4.1.6][RFC9101]
    id_token: "", // authorization response, access token response	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    id_token_hint: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    iss: "", // authorization request, authorization response	IETF	[RFC9207, Section 2][RFC9101][RFC7519, Section 4.1.1]
    issued_token_type: undefined, // token response	IESG	[RFC8693, Section 2.2.1]
    jti: "", // authorization request	IETF	[RFC7519, Section 4.1.7][RFC9101]
    kdcchallenge: undefined, // rs-client response	IETF	[RFC-ietf-ace-key-groupcomm-18]
    login_hint: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    max_age: 0, // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    nbf: "", // authorization request	IETF	[RFC7519, Section 4.1.5][RFC9101]
    nfv_token: undefined, // Access Token Response	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nonce: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    nonce1: undefined, // client-rs request	IETF	[RFC9203]
    nonce2: undefined, // rs-client response	IETF	[RFC9203]
    password: "", // token request	IETF	[RFC6749]
    pct: undefined, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    // pct	authorization server response, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.5]
    prompt: [], // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    redirect_uri: "", // authorization request, token request	IETF	[RFC6749]
    refresh_token: "", // token request, token response	IETF	[RFC6749]
    registration: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    req_cnf: "", // token request	IETF	[RFC9201, Section 5]
    request: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    request_uri: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    requested_token_type: "", // token request	IESG	[RFC8693, Section 2.1]
    resource: "", // authorization request, token request	IESG	[RFC8707]
    response_mode: "", // Authorization Request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OAuth 2.0 Multiple Response Type Encoding Practices]
    response_type: [], // authorization request	IETF	[RFC6749]
    rpt: undefined, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    rs_cnf: undefined, // token response	IETF	[RFC9201, Section 5]
    scope: [], // authorization request, authorization response, token request ???????, token response	IETF	[RFC6749]
    session_state: undefined, // authorization response, access token response	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Session Management 1.0, Section 2]
    sign_info: undefined, // client-rs request, rs-client response	IETF	[RFC-ietf-ace-key-groupcomm-18]
    state: "", // authorization request, authorization response	IETF	[RFC6749]
    sub: "", // authorization request	IETF	[RFC7519, Section 4.1.2][RFC9101]
    subject_token: "", // token request	IESG	[RFC8693, Section 2.1]
    subject_token_type: "", // token request	IESG	[RFC8693, Section 2.1]
    ticket: undefined, // client request, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.1]
    token_type: "", // authorization response, token response	IETF	[RFC6749]
    token_type_hint: "", // IETF    [RFC7009} OAuth 2.0 Token Revocation
    ui_locales: "", // authorization request	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Core 1.0 incorporating errata set 1]
    upgraded: undefined, // authorization server response, token endpoint	[Kantara_UMA_WG]	[UMA 2.0 Grant for OAuth 2.0, Section 3.3.5]
    username: "", // token request	IETF	[RFC6749]
    vtr: "", // authorization request, token request	IESG	[RFC8485]
};
/** Verify token method parameters object */
const verifyTokenJoseOptions = {
    algorithms: [],
    audience: "",
    clockTolerance: "",
    crit: {},
    currentDate: new Date(),
    issuer: "",
    maxTokenAge: "",
    requiredClaims: [],
    subject: "",
    typ: "",
};
;
;
;
;
;
;
/** Parameter names */
const parameterNames = {
    discovery: discoveryParameters,
    authorization: authorizationParameters,
    token: tokenParameters,
    refresh: tokenParameters,
    revocation: revocationParameters,
    verify_token: verifyTokenParameters,
    all: Object.keys(parameters),
};
/** Get endpoint custom parameter type */
const getType = (name) => {
    const value = parameters[name];
    return Array.isArray(value)
        ? "array"
        : value == "{}"
            ? "json"
            : typeof value;
};

/** Configuration object */
const configuration = {
    /** File tag */
    tag: "",
    /**
     * Authorizationn grant values:
     *
     *  'code': Authorization code grant. Default value.
     *  'implicit': Implicit grant,
     *  'hybrid': Code and implicit mixed grant,
     *  'free: Parameters are not modified by the configuration options (config.configuration)
     *      or by other parameters.
     *
     */
    authorization_grant: "",
    /**
     * If true, discovery document is not fetched. Default is false.
     */
    // no_discovery: false,
    /**
     * If true, the service will not use PKCE support. Default is false.
     */
    no_pkce: false,
    /**
     * If true, the service will not use the oauth2 parameter "state". Default is false.
     */
    no_state: false,
    /**
     * If true, the service will have access to the storage. Default is false.
     */
    storage: false,
    /**
     * If true, the methods return the request parameters along with the response.
     */
    test: false,
    /**
     * If true, the revocation endpoint includes the the token in the authorization
     *  header. Default is false.
     */
    revocation_header: false,
    /**
     * Predefined discovery document URI.
     */
    discovery_endpoint: "",
    /**
     * Default is ".well-known/openid-configuration". Ignored if
     *      "discovery_endpoint" is defined. Sufix for the default
     *      discovery document URI.
     */
    well_known_sufix: "",
    /**
     * 'Content-Type' header value for GET/POST requests (without HREF
     *      redirection) from endpoints. Default "application/x-www-form-urlencoded".
     */
    content_type: "",
};
/** Option names */
const configurationOptions = Object.keys(configuration);
/** Authorization grant values */
const authorizationGrantValues = [
    "code", "implicit", "hybrid", "free"
];

/** Methods object */
const methods = {
    /**
     * Custom parameters for the discovery endpoint
     */
    discovery: {},
    /**
     * Custom parameters for the authorizaton endpoint
     */
    authorization: {},
    /**
     * Custom parameters for the token endpoint
     */
    token: {},
    /**
     * Custom parameters for the refresh endpoint
     */
    refresh: {},
    /**
     * JOSE token verification options
     */
    verify_token: {},
    /**
     * Custom parameters for the revocation endpoint
     */
    revocation: {},
};
/** Method names */
const methodNames = Object.keys(methods);

/** Metadata object */
const metadata = {
    acr_values_supported: [], // JSON array containing a list of the Authentication Context Class References that this OP supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    authorization_details_types_supported: [], // JSON array containing the authorization details types the AS supports	IETF	[RFC9396, Section 10]
    authorization_endpoint: "", // URL of the authorization server's authorization endpoint	IESG	[RFC8414, Section 2]
    authorization_response_iss_parameter_supported: false, // Boolean value indicating whether the authorization server provides the iss parameter in the authorization response.	IETF	[RFC9207, Section 3]
    backchannel_authentication_endpoint: "", // CIBA Backchannel Authentication Endpoint	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    backchannel_authentication_request_signing_alg_values_supported: [], // JSON array containing a list of the JWS signing algorithms supported for validation of signed CIBA authentication requests	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    backchannel_logout_session_supported: false, // Boolean value specifying whether the OP can pass a sid (session ID) Claim in the Logout Token to identify the RP session with the OP	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Back-Channel Logout 1.0, Section 2]
    backchannel_logout_supported: false, // Boolean value specifying whether the OP supports back-channel logout, with true indicating support	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Back-Channel Logout 1.0, Section 2]
    backchannel_token_delivery_modes_supported: [], // Supported CIBA authentication result delivery modes	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    backchannel_user_code_parameter_supported: false, // Indicates whether the OP supports the use of the CIBA user_code parameter.	[OpenID_Foundation_MODRNA_Working_Group]	[OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0, Section 4]
    check_session_iframe: "", // URL of an OP iframe that supports cross-origin communications for session state information with the RP Client, using the HTML5 postMessage API	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Session Management 1.0, Section 3.3]
    claim_types_supported: [], // JSON array containing a list of the Claim Types that the OpenID Provider supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    claims_locales_supported: [], // Languages and scripts supported for values in Claims being returned, represented as a JSON array of BCP 47 [RFC5646] language tag values	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    claims_parameter_supported: false, // Boolean value specifying whether the OP supports use of the "claims" parameter	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    claims_supported: [], // JSON array containing a list of the Claim Names of the Claims that the OpenID Provider MAY be able to supply values for	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    code_challenge_methods_supported: [], // PKCE code challenge methods supported by this authorization server	IESG	[RFC8414, Section 2]
    device_authorization_endpoint: "", // URL of the authorization server's device authorization endpoint	IESG	[RFC8628, Section 4]
    display_values_supported: [], // JSON array containing a list of the "display" parameter values that the OpenID Provider supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    dpop_signing_alg_values_supported: [], // JSON array containing a list of the JWS algorithms supported for DPoP proof JWTs	IETF	[RFC9449, Section 5.1]
    end_session_endpoint: "", // URL at the OP to which an RP can perform a redirect to request that the End-User be logged out at the OP	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect RP-Initiated Logout 1.0, Section 2.1]
    frontchannel_logout_supported: false, // Boolean value specifying whether the OP supports HTTP-based logout, with true indicating support	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Front-Channel Logout 1.0, Section 3]
    grant_types_supported: [], // JSON array containing a list of the OAuth 2.0 grant type values that this authorization server supports	IESG	[RFC8414, Section 2]
    id_token_encryption_alg_values_supported: [], // JSON array containing a list of the JWE "alg" values supported by the OP for the ID Token	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    id_token_encryption_enc_values_supported: [], // JSON array containing a list of the JWE "enc" values supported by the OP for the ID Token	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    id_token_signing_alg_values_supported: [], // JSON array containing a list of the JWS "alg" values supported by the OP for the ID Token	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    introspection_encryption_alg_values_supported: [], // JSON array containing a list of algorithms supported by the authorization server for introspection response content key encryption (alg value).	IETF	[RFC-ietf-oauth-jwt-introspection-response-12, Section 7]
    introspection_encryption_enc_values_supported: [], // JSON array containing a list of algorithms supported by the authorization server for introspection response content encryption (enc value).	IETF	[RFC-ietf-oauth-jwt-introspection-response-12, Section 7]
    introspection_endpoint: "", // URL of the authorization server's OAuth 2.0 introspection endpoint	IESG	[RFC8414, Section 2]
    introspection_endpoint_auth_methods_supported: [], // JSON array containing a list of client authentication methods supported by this introspection endpoint	IESG	[RFC8414, Section 2]
    introspection_endpoint_auth_signing_alg_values_supported: [], // JSON array containing a list of the JWS signing algorithms supported by the introspection endpoint for the signature on the JWT used to authenticate the client at the introspection endpoint	IESG	[RFC8414, Section 2]
    introspection_signing_alg_values_supported: [], // JSON array containing a list of algorithms supported by the authorization server for introspection response signing.	IETF	[RFC-ietf-oauth-jwt-introspection-response-12, Section 7]
    issuer: "", // Authorization server's issuer identifier URL	IESG	[RFC8414, Section 2]
    jwks_uri: "", // URL of the authorization server's JWK Set document	IESG	[RFC8414, Section 2]
    mtls_endpoint_aliases: [], // JSON object containing alternative authorization server endpoints, which a client intending to do mutual TLS will use in preference to the conventional endpoints.	IESG	[RFC8705, Section 5]
    nfv_token_encryption_alg_values_supported: [], // JSON array containing a list of the JWE encryption algorithms (alg values) supported by the server to encode the JWT used as NFV Token	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nfv_token_encryption_enc_values_supported: [], // JSON array containing a list of the JWE encryption algorithms (enc values) supported by the server to encode the JWT used as NFV Token	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    nfv_token_signing_alg_values_supported: [], // JSON array containing a list of the JWS signing algorithms supported by the server for signing the JWT used as NFV Token	[ETSI]	[ETSI GS NFV-SEC 022 V2.7.1]
    op_policy_uri: "", // URL that the authorization server provides to the person registering the client to read about the authorization server's requirements on how the client can use the data provided by the authorization server	IESG	[RFC8414, Section 2]
    op_tos_uri: "", // URL that the authorization server provides to the person registering the client to read about the authorization server's terms of service	IESG	[RFC8414, Section 2]
    pushed_authorization_request_endpoint: "", // URL of the authorization server's pushed authorization request endpoint	IESG	[RFC9126, Section 5]
    registration_endpoint: "", // URL of the authorization server's OAuth 2.0 Dynamic Client Registration Endpoint	IESG	[RFC8414, Section 2]
    request_object_encryption_alg_values_supported: [], // JSON array containing a list of the JWE "alg" values supported by the OP for Request Objects	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_object_encryption_enc_values_supported: [], // JSON array containing a list of the JWE "enc" values supported by the OP for Request Objects	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_object_signing_alg_values_supported: [], // JSON array containing a list of the JWS "alg" values supported by the OP for Request Objects	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_parameter_supported: false, // Boolean value specifying whether the OP supports use of the "request" parameter	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    request_uri_parameter_supported: false, // Boolean value specifying whether the OP supports use of the "request_uri" parameter	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    require_pushed_authorization_requests: false, // Indicates whether the authorization server accepts authorization requests only via PAR.	IESG	[RFC9126, Section 5]
    require_request_uri_registration: false, // Boolean value specifying whether the OP requires any "request_uri" values used to be pre-registered	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    require_signed_request_object: false, // Indicates where authorization request needs to be protected as Request Object and provided through either request or request_uri parameter.	IETF	[RFC9101, Section 10.5]
    response_modes_supported: [], // JSON array containing a list of the OAuth 2.0 "response_mode" values that this authorization server supports	IESG	[RFC8414, Section 2]
    response_types_supported: [], // JSON array containing a list of the OAuth 2.0 "response_type" values that this authorization server supports	IESG	[RFC8414, Section 2]
    revocation_endpoint: "", // URL of the authorization server's OAuth 2.0 revocation endpoint	IESG	[RFC8414, Section 2]
    revocation_endpoint_auth_methods_supported: [], // JSON array containing a list of client authentication methods supported by this revocation endpoint	IESG	[RFC8414, Section 2]
    revocation_endpoint_auth_signing_alg_values_supported: [], // JSON array containing a list of the JWS signing algorithms supported by the revocation endpoint for the signature on the JWT used to authenticate the client at the revocation endpoint	IESG	[RFC8414, Section 2]
    scopes_supported: [], // JSON array containing a list of the OAuth 2.0 "scope" values that this authorization server supports	IESG	[RFC8414, Section 2]
    service_documentation: "", // URL of a page containing human-readable information that developers might want or need to know when using the authorization server	IESG	[RFC8414, Section 2]
    signed_metadata: "", // Signed JWT containing metadata values about the authorization server as claims	IESG	[RFC8414, Section 2.1]
    subject_types_supported: [], // JSON array containing a list of the Subject Identifier types that this OP supports	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    tls_client_certificate_bound_access_tokens: false, // Indicates authorization server support for mutual-TLS client certificate-bound access tokens.	IESG	[RFC8705, Section 3.3]
    token_endpoint: "", // URL of the authorization server's token endpoint	IESG	[RFC8414, Section 2]
    token_endpoint_auth_methods_supported: [], // JSON array containing a list of client authentication methods supported by this token endpoint	IESG	[RFC8414, Section 2]
    token_endpoint_auth_signing_alg_values_supported: [], // JSON array containing a list of the JWS signing algorithms supported by the token endpoint for the signature on the JWT used to authenticate the client at the token endpoint	IESG	[RFC8414, Section 2]
    ui_locales_supported: [], // Languages and scripts supported for the user interface, represented as a JSON array of language tag values from BCP 47 [RFC5646]	IESG	[RFC8414, Section 2]
    userinfo_encryption_alg_values_supported: [], // JSON array containing a list of the JWE "alg" values supported by the UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    userinfo_encryption_enc_values_supported: [], // JSON array containing a list of the JWE "enc" values supported by the UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    userinfo_endpoint: "", // URL of the OP's UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
    userinfo_signing_alg_values_supported: [], // JSON array containing a list of the JWS "alg" values supported by the UserInfo Endpoint	[OpenID_Foundation_Artifact_Binding_Working_Group]	[OpenID Connect Discovery 1.0, Section 3]
};
;
/** Metadata names */
const metadataNames = Object.keys(metadata);

/** Configuration object */
const config = {
    /** Configuration section. Configuration options and method parameters */
    configuration: {},
    /** Metadata section. Fields loaded from discovery document override configured values */
    metadata: {},
    /** Parameters section. OAuth parameters. Values ​​returned by endpoints override configured values */
    parameters: {},
    ...methods
};
/** Configuration object sections */
const configSections = [
    ...Object.keys(config),
];

const isObject = (obj) => obj != null && obj.constructor && obj.constructor.name === "Object";

const isNull = (data, isNull) => (data == null) || (isNull?.(data) ?? false);
const notNull = (data, _default, isNull) => (data == null) || (isNull?.(data) ?? false) ? _default : data;
/**
 * Returns true if 'data' is a string or nullish.
 *
 * @param data value to check
 * @returns
 */
const isStrNull = (data) => typeof data == "string" || data == undefined || data == null;
/**
 * Error if 'data' is not a string or nullish. If 'data'
 *   is nullish returns '_default', otherwise it returns 'data'.
 *
 * @param data value to check and convert
 * @param _default default returned value
 * @returns
 */
const notStrNull = (data, _default) => {
    if (!isStrNull(data))
        throw new Error(`${data}" is not a string or nullish.`, { cause: "notStrNull" });
    else
        return !data ? _default : data;
};

/**
 * Returns an (16 x length) hex characters random string
 * @param length Length in groups of 16 hex characters. Defaults to 1
 * @returns
 */
const secureRandom = (length = 1) => {
    const array = new BigUint64Array(length);
    window.crypto.getRandomValues(array);
    const str = array.reduce((p, v) => `${p}${v.toString(16)}`, "");
    return str;
};

const toLowerCaseProperties = (obj) => {
    if (!obj)
        return undefined;
    const genericObj = obj;
    const lowerObj = Object.fromEntries(Object.entries(genericObj).map(([k, v]) => [k.toLowerCase(), v]));
    return lowerObj;
};

const isJSON = (v) => {
    try {
        return !!v && typeof v == "string" && !!JSON.parse(v);
    }
    catch {
        return false;
    }
};

const _setParameters = (ioauth2Parameters = {}, functionName = "") => {
    if (!ioauth2Parameters || Object.entries(ioauth2Parameters).length == 0)
        return {};
    const parameters = toLowerCaseProperties(ioauth2Parameters); // Internal configuration parameters object
    // Parameter names are not unexpected (are warnongs)
    const parmKeys = Object.keys(parameters);
    const parmErrors = parmKeys.filter(key => !parameterNames.all.includes(key));
    if (parmErrors.length)
        console.error(`WARNING: Unexpected parameters: ${parmErrors.join(", ")}.`, {
            message: `Custom parameters must be included inside the enpoint configuration options.`,
            cause: `oauth2 ${functionName}`,
        });
    // Parameters types
    for (const parm in parameters) {
        const key = parm;
        const value = parameters[key];
        const type = getType(key);
        if (value === undefined || value === null) {
            delete parameters[key];
            continue;
        }
        if (type == "array" && typeof value === "string")
            parameters[key] = [value];
        if (type == "array" && typeof value === "number")
            parameters[key] = [value];
        if (type == "array" && typeof value === "bigint")
            parameters[key] = [value];
        if (type == "array" && !Array.isArray(parameters[key])) {
            throw new Error(`The parameter "${key}" must be an array`, {
                cause: `oauth2 ${functionName}`,
            });
        }
        if (type == "json" && !isJSON(value)) {
            throw new Error(`The parameter "${key}" must be of type JSON`, {
                cause: `oauth2 ${functionName}`,
            });
        }
        if (type != "array" &&
            type != "json" &&
            type != "undefined" &&
            type != typeof value) {
            throw new Error(`The parameter "${key}" must be of type ${type}`, {
                cause: `oauth2 ${functionName}`,
            });
        }
    }
    return parameters;
};

/**
 * Processes an initial external configuration object (IOAuth2Config type) and
 *   converts it in the internal configuration object (oauth2Config type).
 *   Converts all undefined booleans to false. Removes all undefined fields. Trims
 *   all string values and removes empty fields. Converts all string[] to
 *   non-empty strings array.
 *
 * @param ioauth2Config The initial external configuration object
 * @returns The internal configuration object
 */
const _oauth2ConfigFactory = (ioauth2Config = {}) => {
    if (!ioauth2Config || Object.entries(ioauth2Config).length == 0)
        return {};
    const cfg = {}; // Internal configuration object
    ioauth2Config = toLowerCaseProperties(ioauth2Config);
    // Configuration sections are objects and not unexpected
    for (const section in ioauth2Config) {
        const key = section;
        const value = ioauth2Config[key];
        if (!isObject(value))
            throw new Error(`Initial configuration section "${section}" is not an object.`, { cause: "oauth2 oauth2ConfigFactory" });
        if (!configSections.includes(section))
            throw new Error(`Unexpected initial configuration section "${section}".`, { cause: "oauth2 oauth2ConfigFactory" });
        cfg[key] = toLowerCaseProperties(value);
    }
    // Configuration options are not unexpected
    cfg.configuration ??= {};
    const confKeys = Object.keys(cfg.configuration);
    const confErrors = confKeys.filter(key => !configurationOptions.includes(key));
    if (confErrors.length)
        throw new Error(`Unexpected configuration options: ${confErrors.join(", ")}`, { cause: "oauth2 oauth2ConfigFactory" });
    cfg.parameters = _setParameters(cfg.parameters, "oauth2ConfigFactory");
    cfg.parameters.redirect_uri ??= window.location.href
        .split("#")[0]
        .split("?")[0];
    cfg.metadata ??= {};
    const metaKeys = Object.keys(cfg.metadata);
    const metaErrors = metaKeys.filter(name => !metadataNames.includes(name));
    if (metaErrors.length)
        console.error(`WARNING: Unexpected metadata fields ${metaErrors.join(", ")}.`, { cause: "oauth2 oauth2ConfigFactory" });
    return cfg;
};

const encrypt = (text) => window.crypto.subtle
    .generateKey({
    name: "AES-GCM",
    length: 256,
}, true, ["encrypt", "decrypt"])
    .then(async (key) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipher = await window.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv,
    }, key, new TextEncoder().encode(text));
    return [key, iv, cipher];
});
const decrypt = (key, iv, cipher) => window.crypto.subtle
    .decrypt({
    name: "AES-GCM",
    iv
}, key, cipher)
    .then(arrayBuffer => new TextDecoder("UTF-8").decode(arrayBuffer));
const arrayBufferToHexString = (arrayBuffer) => {
    const uint8Array = new Uint8Array(arrayBuffer);
    const string = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
    return string;
};
const hexStringToArrayBuffer = (string) => {
    const matchArray = string.match(/[\da-f]{2}/gi);
    if (!matchArray)
        return new ArrayBuffer(0);
    const uint8Array = new Uint8Array(matchArray.map(function (h) {
        return parseInt(h, 16);
    }));
    return uint8Array.buffer;
};
const getCookie = (name) => {
    let start = document.cookie.indexOf(`${name}=`);
    if (start < 0)
        return "";
    start += (name.length + 1);
    const end = document.cookie.indexOf(";", start);
    const value = document.cookie.substring(start, end >= 0 ? end : undefined);
    return value;
};

const _recover_state = async (config, // Parameter passed by reference and updated (oauth2Service.config)
idToken // Parameter passed by reference and updated (oauth2Service.idToken)
) => {
    const cookieValue = getCookie("ngx_oauth2_oidc");
    const hexString = sessionStorage.getItem("oauth2_unload");
    sessionStorage.removeItem("oauth2_unload");
    document.cookie = "ngx_oauth2_oidc=; max-age=0";
    //  The configuration is only restored if it was previously saved and if the current
    //      configuration is empty
    if (!Object.entries(config).length &&
        cookieValue.length == 88 &&
        hexString?.length) {
        const keyValue = cookieValue.substring(0, 64);
        const ivValue = cookieValue.substring(64);
        const keyBuffer = hexStringToArrayBuffer(keyValue);
        const ivBuffer = hexStringToArrayBuffer(ivValue);
        const hexData = hexStringToArrayBuffer(hexString ?? "");
        const importedKey = await window.crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", false, ["decrypt"]);
        const data = await decrypt(importedKey, ivBuffer, hexData);
        const parsed = JSON.parse(data);
        const newConfig = parsed.config ?? config ?? {};
        const newIdToken = parsed.idToken ?? idToken ?? {};
        Object.assign(config, _oauth2ConfigFactory(newConfig)); // Parameter passed by reference and updated
        Object.assign(idToken, newIdToken);
        const storage = config.configuration?.storage;
        setStore("config", storage ? config : null);
        setStore("idToken", storage ? idToken : null);
        setStore("test");
    }
};

/**
 * Converts an object of string type parameters to an IOAuth2Parameters object
 *   and saves the new configuration parameters. Converts the "expires_in" parameter
 *   in a Epoch date (milliseconds)
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @returns An IOAuth2Parameters object
 */
const updateParameters = (obj, config // Passed by reference and updated (configuration.parameters)
) => {
    const storage = config.configuration?.storage;
    const newObj = {}; //<IOAuth2Parameters>{};
    // TODO: test number and boolean conversion
    for (const key in obj) {
        const newKey = key;
        const value = obj[key];
        const type = getType(newKey);
        const newValue = type == "array"
            ? value.split(" ")
            : type == "number"
                ? JSON.parse(value)
                : type == "boolean"
                    ? JSON.parse(value)
                    : value;
        newObj[key] = newValue;
    }
    if (newObj["expires_in"]) {
        newObj["expires_in"] =
            new Date().getTime() + newObj["expires_in"] * 1000;
    }
    config.parameters = {
        ...config.parameters,
        ...newObj,
    };
    setStore("config", storage
        ? config
        : null);
    return newObj;
};

const _interceptor = async (config, // Parameter passed by reference and updated (oauth2Service.config)
idToken // Parameter passed by reference and updated (oauth2Service.idToken)
) => {
    await _recover_state(config, idToken);
    const search = decodeURIComponent(window.location.search);
    const hash = decodeURIComponent(window.location.hash);
    const str = hash.length ? hash : search;
    const substr = str.substring(1);
    const array = substr.length ? substr.split("&") : [];
    const entries = array.map(v => v.split("="));
    const params = Object.fromEntries(entries);
    const parmsState = config?.parameters?.state;
    window.history.replaceState({}, "", window.location.pathname);
    if (!entries.length)
        return Promise.resolve({});
    if (parmsState && parmsState !== params["state"])
        return Promise.reject(new Error(`Ilegal state received.`, {
            cause: "oauth2 interceptor",
        }));
    const newParams = updateParameters(params, config);
    if (newParams["error"])
        return Promise.reject(new Error(`${JSON.stringify(newParams, null, 4)}`, {
            cause: "oauth2 interceptor",
        }));
    return Promise.resolve(newParams);
};

const attributes = {
    // @ts-expect-error
    value: function (predicate) {
        const entries = Object.entries(this);
        return Object.fromEntries(entries.filter(value => predicate(value[0], value[1], this)));
    },
    enumerable: false, // this is actually the default
};
/**
 * Returns the parameters defined within the configuration object
 *   (standard and custom parameters) that are appropriate for
 *   the indicated method. Remove null or undefined
 *   values. Custom parameters overwrite standar parameters.
 *
 * @param method Method name
 * @param config Configuration object
 * @returns Object with the parameters for the method
 */
const getParameters = (method, config) => {
    const parameters = config.parameters ?? {};
    const customParams = config[method] ?? {};
    const standardParms = getStandardParameters(method, parameters);
    const _parms = { ...standardParms, ...customParams };
    Object.defineProperty(_parms, "filter", attributes);
    const parms = _parms.filter((_, value) => value != null);
    return parms;
};
/**
 * Returns the parameters defined within the configuration object
 *   (standard parameters) that are appropriate for the indicated
 *   method. Removes null or undefined parameters.
 *
 * @param method Method name
 * @param parameters Standard configuration parameters
 * @returns Object with the standard parameters for the method
 */
const getStandardParameters = (method, parameters) => {
    const names = parameterNames[method];
    Object.defineProperty(parameters, "filter", attributes);
    // @ts-ignore
    const parms = parameters.filter(key => names.includes(key));
    return parms;
};

/**
 * Verification of the id_token saved in the configuration. Makes use of the 'jose' library.
 *   Needs the "jwks_uri" and "issuer" metadata (see jose library). You also need the parameters.
 *   id_token, client_id, audience (or client_id) and nonce. This data can be overwritten by the
 *   options parameter data. Returns the payload of the id_token and saves it to storage and
 *   memory. In test mode, the request payload is also stored inside sessionStorage.
 *
 * @param config Configuration object saved in memory.
 * @param customParameters Custom parameters for the request. May include values ​​to override 'jwks_uri'
 *      and 'issuer' metadata.
 * @param issuer Authorization server's issuer identifier URL
 * @param jwks_uri URL of the authorization server's JWK Set document
 * @returns The Promise with the id_token payload or error
 */
const _verify_token = async (config, customParameters = {}, _issuer, _jwks_uri) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    // Metadata fields
    const issuer = _issuer ?? config.metadata?.issuer ?? "";
    const jwks_uri = _jwks_uri ?? config.metadata?.jwks_uri ?? "";
    // Endpoint parameters
    const str = (name) => customParameters[name] ?? parms[name] ?? "";
    const parms = _setParameters({
        ...getParameters("verify_token", config),
        ...customParameters,
    });
    const id_token = str("id_token");
    const nonce = str("nonce");
    setStore("test", storage && test ? {} : null);
    if (!id_token)
        return;
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!jwks_uri)
        throw new Error(`Value ​​for 'jwks_uri' metadata is missing.`, {
            cause: "oauth2 verify_token",
        });
    if (!issuer)
        throw new Error(`Value ​​for 'issuer' metadata is missing.`, {
            cause: "oauth2 verify_token",
        });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    // AUDIENCE
    const audience = parms["audience"] ?? parms["client_id"] ?? "";
    if (!audience)
        throw new Error(`The values ​​for the 'client_id' parameter, 'client_id' option, and 'audience' option are missing.`, { cause: "oauth2 verify_token" });
    // JVTVERIFYOPTIONS
    Object.assign(parms, { nonce, issuer, audience, jwks_uri });
    const JWKS = createRemoteJWKSet(new URL(jwks_uri));
    const jvtVerifyOptions = { ...parms };
    delete jvtVerifyOptions["id_token"];
    delete jvtVerifyOptions["jwks_uri"];
    delete jvtVerifyOptions["client_id"];
    // PAYLOAD
    let payload = {};
    try {
        const { payload: readPayload } = await jwtVerify(id_token, JWKS, jvtVerifyOptions);
        payload = readPayload;
    }
    catch (err) {
        const error = new Error(err.message, {
            cause: "oauth2 verify_token",
        });
        error.name = err.name;
        throw error;
    }
    if (payload["nonce"] && payload["nonce"] != nonce) {
        const error = Error('unexpected "nonce" claim value', {
            cause: "oauth2 verify_token",
        });
        error.name = "JWTClaimValidationFailed";
        throw error;
    }
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    if (test) {
        setStore("test", storage ? parms : null);
    }
    return Promise.resolve(payload);
};

/**
 * Returns a new URL form a base URL.
 *   Replaces the protocol if provided. Adds sufix if provided.
 *   Removes trailing slashes if removeTrailingSlash is true.
 *
 * @param base Initial URL
 * @param protocol New protocol
 * @param sufix URL sufix
 * @param removeTrailingSlash If true, removes trailing slashes
 * @returns New URL
 */
const mountUrl = (base, protocol, sufix, removeTrailingSlash) => {
    let url = base;
    if (protocol) {
        const matches = url.match(/^.+:\/\//);
        const currentProtocol = matches ? matches[0].toLowerCase() : "";
        const newProtocol = `${protocol}://`.toLowerCase();
        if (currentProtocol && currentProtocol != newProtocol) {
            url = url.replace(currentProtocol, newProtocol);
        }
        if (!currentProtocol) {
            const error = () => url.startsWith(":") || url.startsWith("/");
            while (error())
                url = url.slice(1);
            url = `${newProtocol}${url}`;
        }
    }
    if (sufix) {
        const error = () => url.endsWith(":") || url.endsWith("/");
        while (error())
            url = url.slice(0, -1);
        url = `${url}/${sufix}`;
    }
    if (removeTrailingSlash) {
        const error = () => url.endsWith("/");
        while (error())
            url = url.slice(0, -1);
    }
    return url;
};

/**
 * Gets an object of string type parameters and saves the new configuration metadata.
 *
 * @param obj The object of string type parameters
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @returns An IOAuth2Parameters object
 */
const updateMetadata = (obj, config // Passed by reference and updated (configuration.metadata)
) => {
    const storage = config.configuration?.storage;
    config.metadata = {
        ...config.metadata,
        ...obj,
    };
    const id_token = config.parameters?.id_token;
    setStore("config", storage
        ? config
        : null);
    return obj;
};

/**
 * Gets an HttpClient get or post request response. If "areParameters" is true (default)
 *   the response is converted to IOAuth2Parameters and actualizes config.parameters.
 *   Otherwise, the response actualizes config.metadata.
 *
 * @param request HttpClient get or post method response. (Observable)
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param areParameters If true (default), the response is converted to IOAuth2Parameters
 *      and actualizes config.parameters. If false, the response actualizes config.metadata
 * @returns Promise with the request response (or error).
 */
const httpRequest = (request, config, // Passed by reference and updated
areParameters = true) => lastValueFrom(request.pipe(map(res => areParameters
    ? updateParameters(res, config)
    : updateMetadata(res, config)), catchError(err => {
    throw err;
})));

const _save_state = async (config, idToken) => {
    const text = JSON.stringify({ config, idToken });
    const [key, iv, cipher] = await encrypt(text);
    const keyRaw = await window.crypto.subtle.exportKey("raw", key);
    const keyString = arrayBufferToHexString(keyRaw);
    const cipherString = arrayBufferToHexString(cipher);
    const ivString = arrayBufferToHexString(iv);
    document.cookie = `ngx_oauth2_oidc=${keyString}${ivString}; secure; samesite=strict`;
    sessionStorage.setItem("oauth2_unload", cipherString);
};

/**
 * Request to an OAuth2 endpoint. Redirects to the endpoint or makes a HttpClient
 *   get or post request.
 *
 * @param method Request method ("""HREF" for redirection)
 * @param url Endpoint URL
 * @param {HttpClient} request- HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param customParameters OAuth2 parameters (standard and custom) for the request. (payload)
 * @param endpoint Endpoint name (for error messages and to determine the type of response)
 * @returns Promise with the request response (or error). In test mode the promise
 *      returns an array with the response (or error) and the request payload.
 */
const request = async (method, url, request, config, // Passed by reference and updated
customParameters = {}, endpoint) => {
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const content_type = config.configuration?.content_type ??
        "application/x-www-form-urlencoded";
    const revocation_header = config.configuration?.revocation_header;
    const tokenHeader = endpoint === "revocation" && revocation_header
        ? {
            Authorization: `Bearer ${customParameters["token"]}`
        }
        : undefined;
    const headersInit = {
        Accept: "application/json",
        "Content-Type": content_type,
        ...tokenHeader,
    };
    const headers = new HttpHeaders(headersInit);
    setStore("test", storage && test ? {} : null);
    if (!url) {
        const err = new Error(`missing endpoint.`, {
            cause: `oauth2 ${endpoint}`,
        });
        throw err;
    }
    if (revocation_header)
        delete customParameters["token"];
    const payload = {};
    // options to params
    for (const key in customParameters) {
        let v = customParameters[key]; // Option value
        Array.isArray(v) && (v = v.join(" ")); // String array to a string of space separated values.
        if (v || v === false)
            payload[key] = v.toString(); // If not nullish nor empty, added to params.
    }
    const params = new HttpParams({ fromObject: payload });
    // For testing purposes
    if (test) {
        const data = Object.keys(payload).length
            ? payload
            : { "@URL": url };
        setStore("test", storage ? data : null);
    }
    if (method == "HREF") {
        _save_state(config, {});
        // Redirection
        const req = new HttpRequest(method, url, null, {
            params,
        });
        location.href = req.urlWithParams;
        return {};
    }
    const req = method == "POST"
        ? request.post(url, "null", {
            headers,
            params,
            observe: "body",
        })
        : request.get(url, {
            headers,
            params,
            observe: "body",
        });
    return httpRequest(req, config, endpoint !== "discovery");
};

/**
 * Request to the discovery endpoint. Returns the discovery document and saves
 *   the metadata in the configuration object (in memory and storage). HttpClient
 *   get request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Metadata or error)
 */
const _fetchDiscoveryDoc = async (request$1, config, // Passed by reference and updated (configuration.metadata)
customParameters = {}, url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const discovery_endpoint = config.configuration?.discovery_endpoint;
    const sufix = config.configuration?.well_known_sufix ??
        ".well-known/openid-configuration";
    // Metadata fields
    const issuer = config.metadata?.issuer ?? "";
    // url
    url ??= discovery_endpoint ?? mountUrl(issuer, "https", sufix);
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("discovery", config),
        ...customParameters,
    });
    setStore("test", storage && test ? {} : null);
    if (!url)
        throw new Error(`The value of the 'url' option or the 'discovery_endpoint' configuration field or the 'issuer' metadata field is missing.`, {
            cause: `oauth2 fetchDiscoveryDoc`,
        });
    // @ts-expect-error: Until HTMLFencedFrameElement is not experimental
    if (window.HTMLFencedFrameElement) {
        // TODO: Test use when not experimental
    }
    return request("GET", url, request$1, config, parms, "discovery");
};

/**
 * Request to then OAuth2 authorization endpoint. Redirects to the endpoint.
 *   The interceptor function inside the onInit method gets the response and actualizes
 *   the config.parameters. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param statePayload Payload to add to state parameter
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
const _authorization = async (request$1, config, // Passed by reference and updated (configuration.parameters)
customParameters = {}, statePayload = "", url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const no_pkce = !!config.configuration?.no_pkce;
    const no_state = !!config.configuration?.no_state;
    // TODO: authorization_grant 'hybrid' and 'free'
    const grant = config.configuration?.authorization_grant ?? "code";
    const basicGrant = ["code", "implicit", "hybrid"].includes(grant);
    // Metadata fields
    const authorization_endpoint = config.metadata?.authorization_endpoint;
    // url
    url ??= authorization_endpoint ?? "";
    // Endpoint parameters
    const arr = (name) => (parms[name] ?? []).map(str => str.toLowerCase());
    const parms = _setParameters({
        ...getParameters("authorization", config),
        ...{ state: null, nonce: null }, // This parameters must be created or as custom parameters
        ...customParameters,
    });
    const scope = arr("scope");
    const response_type = arr("response_type");
    const code_verifier = (parms["code_verifier"] ??
        config.token?.["code_verifier"] ?? // Code verifier is used by the token endpoint
        config.parameters?.code_verifier);
    const code_challenge_method = parms["code_challenge_method"];
    const code_challenge = parms["code_challenge"];
    const pkce = { code_challenge, code_challenge_method, code_verifier };
    let stateString, state, nonce;
    setStore("test", storage && test ? {} : null);
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!url)
        throw new Error(`The value of the 'authorization_endpoint' metadata field or the 'url' option is missing.`, {
            cause: `oauth2 authorization`,
        });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    // SCOPE (must be processed before response_type)
    if (!scope.length) {
        scope.push("openid", "email", "profile");
    }
    // RESPONSE_TYPE (must be processed before nonce)
    if (basicGrant || response_type.length > 1) {
        const noneIdx = response_type.indexOf("none");
        if (noneIdx >= 0)
            response_type.splice(noneIdx, 1);
    }
    if (grant == "code") {
        response_type.splice(0, 10, "code");
    }
    if (grant == "implicit") {
        // scope is not empty
        const userScopes = ["openid", "email", "profile"];
        const hasUserScope = scope.some(str => userScopes.includes(str));
        const hasApiScope = scope.some(str => !userScopes.includes(str));
        const codeIdx = response_type.indexOf("code");
        const tokenIdx = response_type.indexOf("token");
        const idTokenIdx = response_type.indexOf("id_token");
        codeIdx >= 0 && response_type.splice(codeIdx, 1);
        hasUserScope &&
            idTokenIdx < 0 &&
            tokenIdx < 0 &&
            response_type.push("id_token");
        hasApiScope && tokenIdx < 0 && response_type.push("token");
    }
    // PKCE
    for (const prop in pkce)
        delete pkce[prop];
    if (no_pkce || grant != "code") {
        delete parms["code_challenge"];
        delete parms["code_challenge_method"];
        delete parms["code_verifier"];
    }
    else {
        Object.assign(pkce, await getPkce(parms, code_verifier));
    }
    // STATE
    if (no_state && storage) {
        delete parms["state"];
    }
    else {
        stateString = notStrNull(parms["state"], secureRandom(2));
        state = { state: stateString + statePayload };
    }
    // NONCE
    const idTokenIdx = response_type.indexOf("id_token");
    if (grant == "code" || (grant == "implicit" && idTokenIdx >= 0)) {
        // TODO: Hashed nonce
        const str_nonce = notStrNull(parms["nonce"], secureRandom(2));
        nonce = { nonce: str_nonce };
    }
    else {
        delete parms["nonce"];
    }
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    const newParameters = {
        ...pkce,
        ...state,
        ...nonce,
    };
    const payload = {
        ...parms,
        ...newParameters,
        scope,
        response_type,
    };
    // The 'code_verifier' is used by the token endpoint
    delete payload["code_verifier"];
    // The 'code_challenge' and 'code_challenge_method' are no longer needed
    delete newParameters["code_challenge"];
    delete newParameters["code_challenge_method"];
    config.parameters = {
        ...config.parameters,
        ...newParameters,
    };
    setStore("config", storage
        ? config
        : null);
    return request("HREF", url, request$1, config, payload, "authorization");
};
const getPkce = async (parms, verifier) => {
    let method = parms["code_challenge_method"];
    if (!isStrNull(method))
        throw new Error(`The code challenge method "${method}",
            must be a string or nullish.`, { cause: "oauth2 authorization" });
    if (!isStrNull(verifier))
        throw new Error(`The code verifier "${verifier}",
                must be a string or nullish.`, { cause: "oauth2 authorization" });
    method = notStrNull(method, "S256");
    method = method.toLowerCase() == "plain" ? "plain" : method;
    method = method.toLowerCase() == "s256" ? "S256" : method;
    if (method != "plain" && method != "S256")
        throw new Error(`unexpected code challenge method "${method}".`, { cause: "oauth2 authorization" });
    verifier = notStrNull(verifier, (await pkceChallenge(128)).code_verifier);
    let challenge = (parms["code_challenge"]);
    challenge = notStrNull(challenge, await generateChallenge(verifier));
    return {
        code_challenge_method: method,
        code_verifier: verifier,
        code_challenge: challenge,
    };
};

/**
 * Request to the token endpoint. Returns the tokens and othe date returned by
 *   the endpoint and saves it in the configuration parameters (in memory and storage).
 *   HttpClient post request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object or worker request
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
const _token = async (request$1, config, // Passed by reference and updated (configuration.parameters)
customParameters = {}, url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const no_pkce = !!config.configuration?.no_pkce;
    // Metadata fields
    const token_endpoint = config?.metadata?.token_endpoint;
    // url
    url ??= token_endpoint ?? "";
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("token", config),
        ...customParameters,
    });
    const grant_type = parms["grant_type"];
    setStore("test", storage && test ? {} : null);
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!url)
        throw new Error(`Missing Value ​​for metadata field 'token_endpoint' or option 'url'.`, { cause: `oauth2 token ${grant_type}` });
    if (!grant_type)
        throw new Error(`Missing value ​​for configuration parameter 'grant_type'.`, {
            cause: `oauth2 token`,
        });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    if (grant_type == "authorization_code") {
        delete parms["assertion"];
        delete parms["device_code"];
        delete parms["refresh_token"];
        if (!no_pkce) {
            // "code_verifier" is for only one use
            delete config.token?.["code_verifier"];
            delete config.parameters?.code_verifier;
            const id_token = config.parameters?.id_token;
            setStore("config", storage
                ? config
                : null);
        }
    }
    if (grant_type == "refresh_token") {
        delete parms["assertion"];
        delete parms["code"];
        delete parms["code_verifier"];
        delete parms["device_code"];
    }
    if (no_pkce) {
        delete parms["code_verifier"];
    }
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    return request("POST", url, request$1, config, parms, "token");
};

/**
 * Access token revocation within configuration. If the parameter token_type_hint
 *   is equal to 'refresh_token' and the refresh_token exists, it is revoked. Default
 *   revokes access token; otherwise, the refresh token. You can indicate the option token,
 *   access_token or update_token.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      could be updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
const _revocation = async (request$1, config, // Passed by reference and could be updated (configuration.parameters)
customParameters = {}, url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    // Metadata fields
    const revocation_endpoint = config.metadata?.revocation_endpoint;
    // url
    url ??= revocation_endpoint ?? "";
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("revocation", config),
        ...customParameters,
    });
    const token_type_hint = parms["token_type_hint"];
    const access_token = parms["access_token"];
    const refresh_token = parms["refresh_token"];
    let token = parms["token"];
    setStore("test", storage && test ? {} : null);
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!url)
        throw new Error(`Missing value for option 'url' or metadata field 'revocation_endpoint'.`, { cause: "oauth2 revocation" });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    // TOKEN & ACCESS_TOKEN & REFRESH_TOKEN
    delete parms["access_token"];
    delete parms["refresh_token"];
    token =
        parms["token"] ??
            (!token_type_hint
                ? undefined
                : token_type_hint == "refresh_token"
                    ? refresh_token
                    : access_token) ??
            (!token_type_hint ? access_token ?? refresh_token : undefined);
    // TOKEN ERRORS
    if (token_type_hint && !token)
        throw new Error(`The token indicated by the token_type_hint is missing.`, { cause: "oauth2 revocation" });
    if (!token)
        throw new Error(`Missing value for parameters 'token' or 'access_token' or 'refresh_token'.`, { cause: "oauth2 revocation" });
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    return request("POST", url, request$1, config, token ? { ...parms, token } : parms, "revocation");
};

const _errorArray = (err) => {
    const isHttpError = err instanceof HttpErrorResponse;
    const isOAuth2Error = isHttpError && !!err.error.error;
    const isJOSEError = err instanceof JOSEError;
    const error = isOAuth2Error
        ? [[err.error.error, err.error.error_description]]
        : isHttpError
            ? [
                [
                    err.statusText,
                    err.message,
                ],
            ]
            : isJOSEError
                ? [[err.name, err.message]]
                : err.cause
                    ? [[err.cause, err.message]]
                    : err.name
                        ? [[err.name, err.message]]
                        : typeof err == "object"
                            ? Object.entries(err ?? {})
                            : [[(err ?? "").toString(), ""]];
    return error;
};

const _api_request = async (request, config, customParameters = {}, url, method = "GET", jsonHeaders = {}, body = {}) => {
    const test = config.configuration?.test;
    const content_type = config.configuration?.content_type ??
        "application/x-www-form-urlencoded";
    const { access_token } = customParameters;
    const tokenHeader = access_token
        ? {
            Authorization: `Bearer ${access_token}`,
        }
        : undefined;
    jsonHeaders = { ...jsonHeaders };
    for (const key in jsonHeaders) {
        jsonHeaders[key] = JSON.stringify(jsonHeaders[key]).replace(/^"|"$/g, "");
    }
    const headersInit = {
        Accept: "application/json",
        "Content-Type": content_type,
        ...tokenHeader,
        ...jsonHeaders
    };
    const headers = new HttpHeaders(headersInit);
    setStore("test", test ? {} : null);
    if (!url) {
        const err = new Error(`missing endpoint.`, {
            cause: `oauth2 apiRequest`,
        });
        throw err;
    }
    const payload = {};
    // options to params
    for (const key in customParameters) {
        let v = customParameters[key]; // Option value
        Array.isArray(v) && (v = v.join(" ")); // String array to a string of space separated values.
        if (v || v === false)
            payload[key] = v.toString(); // If not nullish nor empty, added to params.
    }
    const params = new HttpParams({ fromObject: payload });
    // For testing purposes
    if (test) {
        const data = Object.keys(payload).length
            ? payload
            : { "@URL": url };
        setStore("test", data);
    }
    const req = method == "POST"
        ? request.post(url, body, {
            headers,
            params,
            observe: "body",
        })
        : request.get(url, {
            headers,
            params,
            observe: "body",
        });
    return lastValueFrom(req.pipe(catchError(err => {
        throw err;
    })));
};

const OAUTH2_CONFIG_TOKEN = new InjectionToken("OAuth2 Config");
class Oauth2Service {
    get config() {
        return this._config;
    }
    get idToken() {
        return this._idToken;
    }
    // FLAGS
    get isIdTokenIntercepted() {
        return this._isIdTokenIntercepted;
    }
    get isAccessTokenIntercepted() {
        return this._isAccessTokenIntercepted;
    }
    get isCodeIntercepted() {
        return this._isCodeIntercepted;
    }
    constructor(oauth2Config) {
        this.oauth2Config = oauth2Config;
        this.http = inject(HttpClient);
        this._config = {};
        this._idToken = {}; // Api user id_token claims
        this._isIdTokenIntercepted = false;
        this._isAccessTokenIntercepted = false;
        this._isCodeIntercepted = false;
        this.setConfig = (oauth2Config) => {
            const config = _oauth2ConfigFactory(oauth2Config);
            const storage = config.configuration?.storage;
            this._config = config;
            this._idToken = {};
            if (!storage)
                return;
            setStore("config", storage ? config : null);
            setStore("idToken");
            setStore("test");
            return this.config;
        };
        this.setParameters = (parameters) => {
            const parms = { ...parameters };
            const configParms = { ...this.config.parameters };
            const storage = this.config.configuration?.storage;
            for (const parm in parameters) {
                const key = parm;
                const value = parameters[key];
                if (value === undefined || value === null) {
                    delete configParms[key];
                }
            }
            parameters = _setParameters(parms, "setParameters");
            this._config.parameters = { ...configParms, ...parameters };
            setStore("config", storage ? this.config : null);
        };
        /**
         * Each endpoint uses the parameters defined within the 'parameters' section (config.parameters)
         *      that are applicable to it. Custom endpoint parameters (config.endpoint_name} can
         *      override standard parameters. Inline custom parameters (o auth2Service.endpoint(customParameters, ...) )
         *      can override the configured parameters (standard or custom). An inline parameter with a
         *      null value removes the configured parameter ( oauth2Service.endpoint({parm: null}, ...) ).
         *
         * @param customParameters
         * @param url
         * @returns
         */
        this.fetchDiscoveryDoc = (customParameters = {}, url) => {
            return _fetchDiscoveryDoc(this.http, this._config, // Parameter passed by reference and updated (config.metadata)
            customParameters, url);
        };
        /**
         * Each endpoint uses the parameters defined within the 'parameters' section (config.parameters)
         *      that are applicable to it. Custom endpoint parameters (config.endpoint_name} can
         *      override standard parameters. Inline custom parameters (o auth2Service.endpoint(customParameters, ...) )
         *      can override the configured parameters (standard or custom). An inline parameter with a
         *      null value removes the configured parameter ( oauth2Service.endpoint({parm: null}, ...) ).
         *
         * @param customParameters
         * @param statePayload
         * @param url
         * @returns
         */
        this.authorization = async (customParameters = {}, statePayload, url) => {
            return _authorization(this.http, this._config, // Parameter passed by reference and updated (config.parameters)
            customParameters, statePayload, url);
        };
        this.token = async (customParameters = {}, url) => {
            return _token(this.http, this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "authorization_code",
                ...customParameters,
            }, url);
        };
        this.apiRequest = async (customParameters = {}, url, method = "GET", headers = {}, body = {}) => {
            return _api_request(this.http, this.config, customParameters, url, method, headers, body);
        };
        this.refresh = async (customParameters = {}, url) => {
            return _token(this.http, this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "refresh_token",
                redirect_uri: null,
                ...customParameters,
            }, url);
        };
        this.revocation = async (customParameters = {}, url) => {
            return _revocation(this.http, this._config, // Parameter passed by reference and could be updated (config.parameters)
            customParameters, url);
        };
        this.verify_token = async (customParameters = {}, issuer, jwks_uri) => {
            const storage = this.config.configuration?.storage;
            this._idToken = {};
            setStore("idToken");
            await _verify_token(this.config, customParameters, issuer, jwks_uri).then(idToken => {
                this._idToken = idToken ?? {};
                setStore("idToken", storage ? this.idToken : null);
            });
        };
        this.interceptor = async () => {
            const int = _interceptor(this._config, // Parameter passed by reference and updated (oauth2Service.config.parameters)
            this._idToken // Parameter passed by reference and updated (oauth2Service.idToken)
            );
            await int.then(v => {
                this._isIdTokenIntercepted = !!v.id_token;
                this._isAccessTokenIntercepted = !!v.access_token;
                this._isCodeIntercepted = !!v.code;
            });
            return int;
        };
        this.saveState = async () => await _save_state(this._config, this._idToken);
        this.recoverState = async () => {
            await _recover_state(this._config, this._idToken);
        };
        this.errorArray = (err) => {
            return _errorArray(err);
        };
        const newConfig = oauth2Config ?? {};
        const config = _oauth2ConfigFactory(newConfig);
        const storage = config.configuration?.storage;
        this._config = config;
        setStore("config", storage ? config : null);
        setStore("idToken");
        setStore("test");
    }
    static { this.ɵfac = function Oauth2Service_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Oauth2Service)(i0.ɵɵinject(OAUTH2_CONFIG_TOKEN)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Oauth2Service, factory: Oauth2Service.ɵfac, providedIn: "root" }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Oauth2Service, [{
        type: Injectable,
        args: [{
                providedIn: "root",
            }]
    }], () => [{ type: undefined, decorators: [{
                type: Inject,
                args: [OAUTH2_CONFIG_TOKEN]
            }] }], null); })();

const provideOAuth2 = (config = null) => makeEnvironmentProviders([
    Oauth2Service,
    { provide: OAUTH2_CONFIG_TOKEN, useValue: config },
]);

const idTokenGuard = (path = "") => async () => {
    const oauth2 = inject(Oauth2Service);
    const router = inject(Router);
    await oauth2.recoverState();
    const sub = oauth2.idToken["sub"];
    return sub ? true : router.createUrlTree([path]);
};

/*
 * Public API Surface of ngx-oauth2-oidc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { OAUTH2_CONFIG_TOKEN, Oauth2Service, authorizationGrantValues, configSections, configurationOptions, getType, idTokenGuard, metadataNames, methodNames, parameterNames, provideOAuth2 };
//# sourceMappingURL=ngx-oauth2-oidc.mjs.map

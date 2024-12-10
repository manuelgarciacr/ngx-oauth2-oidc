/** Authorization endpoint parameter names */
declare const authorizationParameters: string[];
/** Token endpoint parameter names */
declare const tokenParameters: string[];
/** Verify token method parameter names */
declare const verifyTokenParameters: string[];
/** Revocation endpoint parameter names */
declare const revocationParameters: string[];
/** OAuth2Parameters object */
declare const parameters: {
    access_token: string;
    ace_client_recipientid: unknown;
    ace_profile: unknown;
    ace_server_recipientid: unknown;
    acr_values: string;
    actor_token: string;
    actor_token_type: string;
    assertion: string;
    aud: string;
    audience: string;
    authorization_details: string;
    claim_token: unknown;
    claims: string;
    claims_locales: string;
    client_assertion: string;
    client_assertion_type: string;
    client_id: string;
    client_secret: string;
    cnf: unknown;
    code: string;
    code_challenge: string;
    code_challenge_method: "S256" | "plain";
    code_verifier: string;
    device_code: string;
    display: "page" | "popup" | "touch" | "wap";
    dpop_jkt: string;
    error: string;
    error_description: string;
    error_uri: string;
    exp: string;
    expires_in: number;
    grant_type: string;
    iat: string;
    id_token: string;
    id_token_hint: string;
    iss: string;
    issued_token_type: unknown;
    jti: string;
    kdcchallenge: unknown;
    login_hint: string;
    max_age: number;
    nbf: string;
    nfv_token: unknown;
    nonce: string;
    nonce1: unknown;
    nonce2: unknown;
    password: string;
    pct: unknown;
    prompt: "none"[] | ("login" | "consent" | "select_account")[];
    redirect_uri: string;
    refresh_token: string;
    registration: string;
    req_cnf: string;
    request: string;
    request_uri: string;
    requested_token_type: string;
    resource: string;
    response_mode: "query" | "fragment";
    response_type: string[];
    rpt: unknown;
    rs_cnf: unknown;
    scope: string[];
    session_state: unknown;
    sign_info: unknown;
    state: string;
    sub: string;
    subject_token: string;
    subject_token_type: string;
    ticket: unknown;
    token_type: string;
    token_type_hint: "access_token" | "refresh_token" | "pct";
    ui_locales: string;
    upgraded: unknown;
    username: string;
    vtr: string;
};
/** Verify token method parameters object */
declare const verifyTokenJoseOptions: {
    algorithms: string[];
    audience: string | string[];
    clockTolerance: string | number;
    crit: {
        [key: string]: boolean;
    };
    currentDate: Date;
    issuer: string | string[];
    maxTokenAge: string | number;
    requiredClaims: string[];
    subject: string;
    typ: string;
};
/** Parameters section type */
export interface IOAuth2Parameters extends Partial<typeof parameters> {
}
/** Authorization endpoint parameters object type */
export interface IOAuth2AuthorizationParameters extends Partial<typeof authorizationParameters> {
}
/** Token endpoint parameters object type */
export interface IOAuth2TokenParameters extends Partial<typeof tokenParameters> {
}
/** Verify token method parameters object type */
export interface IOAuth2VerifyTokenParameters extends Partial<typeof verifyTokenParameters> {
}
/** Verify token method jose options object type */
export interface IOAuth2VerifyTokenJoseOptions extends Partial<typeof verifyTokenJoseOptions> {
}
/** Revocation endpoint parameters object type */
export interface IOAuth2RevocationParameters extends Partial<typeof revocationParameters> {
}
/** Parameter names */
export declare const parameterNames: {
    discovery: string[];
    authorization: string[];
    token: string[];
    refresh: string[];
    revocation: string[];
    verify_token: string[];
    all: string[];
};
/** Get endpoint custom parameter type */
export declare const getType: (name: keyof IOAuth2Parameters) => "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "json";
export {};
//# sourceMappingURL=IOAuth2Parameters.d.ts.map
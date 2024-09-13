import { TestBed } from "@angular/core/testing";

import { Oauth2Service } from "../lib/oauth2.service";
import { provideHttpClient } from "@angular/common/http";
import {
    HttpTestingController,
    provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideOAuth2 } from "../lib/provide-oauth2";
import { IOAuth2Config } from "../domain";

describe("Oauth2Service authorization", () => {
    const issuer = "issuerName";
    const oauth2Config = { metadata: { issuer } };
    const errorCause = "oauth2 authorization";
    const errorMessage =
        "Values ​​for metadata 'authorization_endpoint' and option 'url' are missing.";
    const www = window.location.href;

    let service: Oauth2Service;
    let httpTesting: HttpTestingController;
    let originalTimeout: number;

    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideOAuth2(),
            ],
        });

        window.sessionStorage.clear(); // Must be executed before Oauth2Service injection
        service = TestBed.inject(Oauth2Service);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    it("#authorization simple code request should return value from promise", (done: DoneFn) => {
        const authorization_endpoint = www + "#newUrl";

        service.setConfig({
            ...oauth2Config,
            metadata: {...oauth2Config.metadata, authorization_endpoint}
        });

        service
            .authorization()
            .then(v => {
                const payload = getPayload(service.config); //{state, nonce, code_challenge_method, code_challenge, scope, response_type};
                const endpoint = getEndPoint(authorization_endpoint, payload);

                expect(window.location.href).toBe(endpoint);
                expect(v).toEqual({});
                done()
            })
            .catch(err => done.fail(err));
    });

    it("#authorization error when undefined or empty endpoint URL", (done: DoneFn) => {
        const authorization_endpoint = "";

        service.setConfig({
            ...oauth2Config,
            metadata: { ...oauth2Config.metadata, authorization_endpoint },
        });

        service
            .authorization()
            .then(v => {
                const err = JSON.stringify(v, null, 4);
                done.fail(err)
            })
            .catch(err => {
                expect(err instanceof Error).toBeTrue();
                expect(err.cause).toBe(errorCause);
                expect(err.message).toBe(errorMessage);
                done();
            });

    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    })
});

describe("Oauth2Service authorization with test", () => {
    const issuer = "issuerName";
    const oauth2Config = { configuration: {test: true}, metadata: { issuer } };
    const errorCause = "oauth2 authorization";
    const errorMessage =
        "Values ​​for metadata 'authorization_endpoint' and option 'url' are missing.";
    const www = window.location.href;

    let service: Oauth2Service;
    let httpTesting: HttpTestingController;
    let originalTimeout: number;

    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideOAuth2(),
            ],
        });

        window.sessionStorage.clear(); // Must be executed before Oauth2Service injection
        service = TestBed.inject(Oauth2Service);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    it("#authorization simple code request should return value from promise", (done: DoneFn) => {
        const authorization_endpoint = www + "#newUrl";

        service.setConfig({
            ...oauth2Config,
            metadata: { ...oauth2Config.metadata, authorization_endpoint },
        });

        service
            .authorization()
            .then(v => {
                const payload = getPayload(service.config); //{state, nonce, code_challenge_method, code_challenge, scope, response_type};
                const endpoint = getEndPoint(authorization_endpoint, payload);
                const stored_payload = sessionStorage.getItem("oauth2_test");

                expect(window.location.href).toBe(endpoint);
                expect(v).toEqual([{}, payload]);
                expect(JSON.parse(stored_payload ?? "")).toEqual(payload);
                done();
            })
            .catch(err => done.fail(err));
    });

    it("#authorization error when undefined or empty endpoint URL", (done: DoneFn) => {
        const authorization_endpoint = "";

        service.setConfig({
            ...oauth2Config,
            metadata: { ...oauth2Config.metadata, authorization_endpoint },
        });

        service
            .authorization()
            .then(v => {
                const err = JSON.stringify(v, null, 4);
                done.fail(err);
            })
            .catch(err => {
                const payload = err[1];
                const stored_payload = sessionStorage.getItem("oauth2_test");
                err = err[0];

                expect(err instanceof Error).toBeTrue();
                expect(err.cause).toBe(errorCause);
                expect(err.message).toBe(errorMessage);
                expect(payload).toEqual({});
                expect(JSON.parse(stored_payload ?? "")).toEqual({});
                done();
            });
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});

const getPayload = (cfg: IOAuth2Config) => {
    const state = cfg.parameters?.state ?? "";
    const nonce = cfg.parameters?.nonce ?? "";
    const code_challenge_method = cfg.parameters?.code_challenge_method ?? "";
    const code_challenge = cfg.parameters?.code_challenge ?? "";
    const scope = "openid";
    const response_type = "code";

    const payload = {
        state,
        nonce,
        code_challenge_method,
        code_challenge,
        scope,
        response_type,
    };

    return payload
}

const getEndPoint = (authorization_endpoint: any, payload: any) => {
    let endpoint = authorization_endpoint;
    endpoint += "?state=" + payload.state;
    endpoint += "&nonce=" + payload.nonce;
    endpoint += "&code_challenge_method=" + payload.code_challenge_method;
    endpoint += "&code_challenge=" + payload.code_challenge;
    endpoint += "&scope=" + payload.scope;
    endpoint += "&response_type=" + payload.response_type;

    return endpoint;
}

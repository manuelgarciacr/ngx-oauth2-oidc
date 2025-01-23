import { TestBed } from "@angular/core/testing";

import { Oauth2Service } from "../lib/oauth2.service";
import { provideHttpClient } from "@angular/common/http";
import {
    HttpTestingController,
    provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideOAuth2 } from "../lib/provide-oauth2";
import { IOAuth2Metadata } from "ngx-oauth2-oidc";

describe("Oauth2Service fetchDiscoveryDoc", () => {
    const issuer = "issuerName";
    const oauth2Config = { metadata: { issuer } };
    const configuration = {
        ...oauth2Config,
        configuration: { well_known_sufix: ".well-known/openid-configuration" },
        parameters: {}
    };
    const discovery_endpoint = 'https://issuerName/.well-known/openid-configuration';
    const discovery_document = {pepe: "Luís"};
    const errorCause = "oauth2 fetchDiscoveryDoc";

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

    it("#fetchDiscoveryDoc should return error", (done: DoneFn) => {
        service
            .discovery()
            .then(v => {
                const err = JSON.stringify(v, null, 4);
                done.fail(err);
            })
            .catch(err => {
                expect(err instanceof Error).toBeTrue();
                expect(err.cause).toBe(errorCause)
                done()
            });
    });

    it("#fetchDiscoveryDoc should return value from promise and store", (done: DoneFn) => {
        expect(service.setConfig(oauth2Config)).toEqual(configuration);
        expect(service.config).toEqual(configuration);

        const config = {...service.config};

        service
            .discovery()
            .then(v => {
                expect(v).toEqual(discovery_document as IOAuth2Metadata);
                done();
            })
            .catch(err => {
                done.fail(err);
            });

        const req = httpTesting.expectOne(
            discovery_endpoint,
            "Request to fetch the discovery document"
        );

        req.flush(discovery_document);

        httpTesting.verify();

        const newConfig = {...config, metadata: {...config.metadata, ...discovery_document}}
        const storedConfig = JSON.parse(
            window.sessionStorage.getItem("oauth2_config") ?? "null"
        );
        const storedDiscovery = JSON.parse(
            window.sessionStorage.getItem("oauth2_discoveryDoc") ?? "null"
        );

        expect(req.request.method).toBe("GET");
        expect(service.config).toEqual(newConfig);
        expect(storedConfig).toEqual(newConfig);
        expect(storedDiscovery).toEqual(discovery_document)
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    })
});

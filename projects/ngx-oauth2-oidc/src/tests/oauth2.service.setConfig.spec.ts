import { TestBed } from "@angular/core/testing";

import { Oauth2Service } from "../lib/oauth2.service";
import { provideHttpClient } from "@angular/common/http";
import {
    HttpTestingController,
    provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideOAuth2 } from "../lib/provide-oauth2";

describe("Oauth2Service setConfig", () => {
    const issuer = "issuerName";
    const oauth2Config = { metadata: { issuer } };
    const settedConfig = {
        ...oauth2Config,
        configuration: { well_known_sufix: ".well-known/openid-configuration" },
        parameters: {}
    };

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

    it("#setConfig should store and return the setted configuration", () => {
        expect(service.setConfig(oauth2Config)).toEqual(settedConfig);
        expect(service.config).toEqual(settedConfig);
        expect(
            JSON.parse(
                window.sessionStorage.getItem("oauth2_config") ?? ""
            )
        ).toEqual(settedConfig);
        expect(
            JSON.parse(
                window.sessionStorage.getItem("oauth2_initialConfig") ?? ""
            )
        ).toEqual(oauth2Config);
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    })
});

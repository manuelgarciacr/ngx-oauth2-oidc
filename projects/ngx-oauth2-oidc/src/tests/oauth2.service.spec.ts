import { TestBed } from "@angular/core/testing";

import { OAUTH2_CONFIG_TOKEN, Oauth2Service } from "../lib/oauth2.service";
import { provideHttpClient } from "@angular/common/http";
import {
    HttpTestingController,
    provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideOAuth2 } from "../lib/provide-oauth2";
import { IOAuth2Metadata } from "ngx-oauth2-oidc";

describe("Oauth2Service creation", () => {
    const emptyConfig = {
        configuration: { well_known_sufix: ".well-known/openid-configuration" },
        metadata: {},
        parameters: {},
    };
    const providedConfig = { metadata: { issuer: "firstIssuer" } };
    const establishedProvidedConfig = {
        ...emptyConfig,
        ...providedConfig,
    }
    const storedConfig = { metadata: { issuer: "secondIssuer" } };
    const establishedStoredConfig = {
        ...emptyConfig,
        ...storedConfig,
    };

    let service: Oauth2Service;

    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it("OAuth2Service should be created with empty configuration", () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideOAuth2(),
            ],
        });
        service = TestBed.inject(Oauth2Service);

        expect(service).toBeTruthy();
        expect(service.config).toEqual(emptyConfig);
    });

    it("OAuth2Service should be created with provided configuration", () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                {
                    provide: OAUTH2_CONFIG_TOKEN,
                    useValue: providedConfig,
                },
            ],
        });
        service = TestBed.inject(Oauth2Service);

        expect(service).toBeTruthy();
        expect(service.config).toEqual(establishedProvidedConfig);
    });

    it("OAuth2Service should be created with stored configuration", () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideOAuth2(),
            ],
        });
        window.sessionStorage.setItem("oauth2_config", JSON.stringify(storedConfig));
        service = TestBed.inject(Oauth2Service);

        expect(service).toBeTruthy();
        expect(service.config).toEqual(establishedStoredConfig);
    });

});

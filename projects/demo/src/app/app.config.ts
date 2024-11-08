import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideOAuth2 } from "ngx-oauth2-oidc";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { fragmentInterceptor } from "./fragmentInterceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        // Neede for ngx-oauth2-oidc
        provideHttpClient(
            withInterceptors([fragmentInterceptor])
        ),
        provideOAuth2(),
        //
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideAnimationsAsync(),
    ],
};

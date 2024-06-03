import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideOAuth2 } from 'ngx-oauth2-oidc';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideOAuth2(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)]
};

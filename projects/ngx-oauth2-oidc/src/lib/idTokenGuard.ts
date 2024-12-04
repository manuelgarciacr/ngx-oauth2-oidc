import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { Oauth2Service } from "./oauth2.service";

export const idTokenGuard =
    (path: string = ""): CanActivateFn =>
    () => {
        const idToken = inject(Oauth2Service).config.parameters?.id_token;

        return idToken ? true : inject(Router).createUrlTree([path]);
    };

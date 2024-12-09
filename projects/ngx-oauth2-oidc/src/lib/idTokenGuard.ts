import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { Oauth2Service } from "./oauth2.service";

export const idTokenGuard =
    (path: string = ""): CanActivateFn =>
    async () => {
        const oauth2 = inject(Oauth2Service);
        const router = inject(Router);

        await oauth2.recoverState();

        const sub = oauth2.idToken["sub"];

        return sub ? true : router.createUrlTree([path]);
    };

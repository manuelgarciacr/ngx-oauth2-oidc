import { CanActivateFn, Router } from "@angular/router";
import { IOAuth2Config } from "../domain";
import { inject } from "@angular/core";

export const idTokenGuard =
    (path: string = ""): CanActivateFn =>
    () => {
        const cfgStr = sessionStorage.getItem("oauth2_config");
        const cfg = JSON.parse(cfgStr ?? "{}") as IOAuth2Config;
        const idToken = !!cfg.parameters?.id_token;
        return idToken ? true : inject(Router).createUrlTree([path]);
    };

import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';

const canActivateUser: CanActivateFn = () =>
    sessionStorage.getItem("oauth2_userProfile")
        ? true
        : inject(Router).createUrlTree(["/login"]);

export const routes: Routes = [
    {
        path: "login",
        loadComponent: () => import("./index").then(c => c.LoginComponent),
    },
    {
        path: "home",
        loadComponent: () => import("./index").then(c => c.HomeComponent),
        canActivate: [canActivateUser],
    },
    // otherwise redirect to login or error page
    { path: "", redirectTo: "/login", pathMatch: "full" },
    {
        path: "**",
        loadComponent: () =>
            import("./index").then(c => {
                return c.E404Component;
            }),
    },
];

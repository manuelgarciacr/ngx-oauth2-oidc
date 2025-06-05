import { Routes } from '@angular/router';
import { idTokenGuard } from 'ngx-oauth2-oidc';

export const routes: Routes = [
    {
        path: "login",
        loadComponent: () => import(".").then(c => c.LoginComponent),
    },
    {
        path: "home",
        loadComponent: () => import(".").then(c => c.HomeComponent),
        canActivate: [idTokenGuard()],
    },
    {
        path: "privacy-policy",
        loadComponent: () => import(".").then(c => c.PrivacyPolicyComponent),
    },
    {
        path: "",
        redirectTo: "/login",
        pathMatch: "full",
    },
    {
        path: "**",
        redirectTo: "/login",
        pathMatch: "full",
    },
];

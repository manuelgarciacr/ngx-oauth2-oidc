import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: "foo", loadChildren: () => import("./app-routing.module").then(m => m.AppRoutingModule)},
    {path: "anotherFoo"}
];

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
    {
        path: "baa",
        loadChildren: () =>
            import("./app-routing.child.module").then(
                m => m.AppRoutingChildModule
            ),
    },
    { path: "foo", component: LoginComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingChildModule {}

const routeA = {path: "foo"};
const routeB = {path: "anotherPath"}
const localRoutes: Routes = [
    routeA,
    routeB
]

@NgModule({
    imports: [RouterModule.forRoot(localRoutes)],
    exports: [RouterModule],
})
export class AppRoutingChildModule02 {}
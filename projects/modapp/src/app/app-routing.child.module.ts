import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
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


const children = [{ path: "foo" }, { path: "anotherPath" }]
const spreadChildren: Route = {
    children
};
const spreadFooPath = {
    path: "fo" + "o"
}
const spreadAnotherPath = {
    path: "anotherPath",
};

const routeA = {...spreadFooPath, children};
const routeB: Route = {...spreadAnotherPath, children: [spreadChildren], ...spreadChildren}
const routeC = {...spreadFooPath, ...spreadChildren}

const localRoutes: Routes = [
    routeA,
    routeB,
    routeC
]

@NgModule({
    imports: [RouterModule.forRoot(localRoutes)],
    exports: [RouterModule],
})
export class AppRoutingChildModule02 {}

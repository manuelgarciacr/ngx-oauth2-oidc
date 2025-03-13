import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { routes as childRoutes, routes as children, routes } from "./app.routes.child";

const localRoutes = [
    {
        path: "baa",
        loadChildren: () =>
            import("./app-routing.child.module").then(
                m => m.AppRoutingChildModule
            ),
        children,
    },
]

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: "baa",
                loadChildren: () =>
                    import("./app-routing.child.module").then(
                        m => m.AppRoutingChildModule
                    ),
                children,
            },
            {
                path: "foo",
                component: LoginComponent,
                children: [{ path: "foo" }],
            },
            {
                path: "cee",
                loadChildren: () =>
                    import("./app-routing.child02.module").then(
                        m => m.AppRoutingChild02Module
                    ),
                children: [...childRoutes, ...routes],
            },
            ...localRoutes,
            ...[{path: "foo"}],
            ...[...localRoutes],
        ]),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}

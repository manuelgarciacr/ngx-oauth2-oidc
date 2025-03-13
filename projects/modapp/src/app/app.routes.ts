import { Routes } from '@angular/router';
import { routes as childRoutes} from './app.routes.child'
import { LoginComponent } from "./login/login.component";

export const routes: Routes = [{path: "foo", component: LoginComponent, children: [...childRoutes]}];
//export const routes: Routes = [{path: "foo", component: LoginComponent, children: [...childRoutes]];
//export const routes: Routes = [{path: "foo", component: LoginComponent, children: childRoutes];
//export const routes: Routes = [{path: "foo", component: LoginComponent, childRoutes];
//export const routes: Routes = [{path: "foo", component: LoginComponent, childRoutes;

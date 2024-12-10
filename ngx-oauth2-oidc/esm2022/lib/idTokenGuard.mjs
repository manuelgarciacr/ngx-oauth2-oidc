import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { Oauth2Service } from "./oauth2.service";
export const idTokenGuard = (path = "") => async () => {
    const oauth2 = inject(Oauth2Service);
    const router = inject(Router);
    await oauth2.recoverState();
    const sub = oauth2.idToken["sub"];
    return sub ? true : router.createUrlTree([path]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRUb2tlbkd1YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LW9hdXRoMi1vaWRjL3NyYy9saWIvaWRUb2tlbkd1YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUIsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFakQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUNyQixDQUFDLE9BQWUsRUFBRSxFQUFpQixFQUFFLENBQ3JDLEtBQUssSUFBSSxFQUFFO0lBQ1AsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU5QixNQUFNLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUU1QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWxDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhbkFjdGl2YXRlRm4sIFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IGluamVjdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYXV0aDJTZXJ2aWNlIH0gZnJvbSBcIi4vb2F1dGgyLnNlcnZpY2VcIjtcblxuZXhwb3J0IGNvbnN0IGlkVG9rZW5HdWFyZCA9XG4gICAgKHBhdGg6IHN0cmluZyA9IFwiXCIpOiBDYW5BY3RpdmF0ZUZuID0+XG4gICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBvYXV0aDIgPSBpbmplY3QoT2F1dGgyU2VydmljZSk7XG4gICAgICAgIGNvbnN0IHJvdXRlciA9IGluamVjdChSb3V0ZXIpO1xuXG4gICAgICAgIGF3YWl0IG9hdXRoMi5yZWNvdmVyU3RhdGUoKTtcblxuICAgICAgICBjb25zdCBzdWIgPSBvYXV0aDIuaWRUb2tlbltcInN1YlwiXTtcblxuICAgICAgICByZXR1cm4gc3ViID8gdHJ1ZSA6IHJvdXRlci5jcmVhdGVVcmxUcmVlKFtwYXRoXSk7XG4gICAgfTtcbiJdfQ==
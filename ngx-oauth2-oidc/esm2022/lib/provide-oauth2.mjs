import { makeEnvironmentProviders } from "@angular/core";
import { OAUTH2_CONFIG_TOKEN, Oauth2Service } from "./oauth2.service";
export const provideOAuth2 = (config = null) => makeEnvironmentProviders([
    Oauth2Service,
    { provide: OAUTH2_CONFIG_TOKEN, useValue: config },
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZS1vYXV0aDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtb2F1dGgyLW9pZGMvc3JjL2xpYi9wcm92aWRlLW9hdXRoMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsd0JBQXdCLEVBQXdCLE1BQU0sZUFBZSxDQUFDO0FBRS9FLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUV0RSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsQ0FDekIsU0FBK0IsSUFBSSxFQUNmLEVBQUUsQ0FDdEIsd0JBQXdCLENBQUM7SUFDckIsYUFBYTtJQUNiLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7Q0FDckQsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWFrZUVudmlyb25tZW50UHJvdmlkZXJzLCBFbnZpcm9ubWVudFByb3ZpZGVycyB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBJT0F1dGgyQ29uZmlnIH0gZnJvbSBcIi4uL2RvbWFpblwiO1xuaW1wb3J0IHsgT0FVVEgyX0NPTkZJR19UT0tFTiwgT2F1dGgyU2VydmljZSB9IGZyb20gXCIuL29hdXRoMi5zZXJ2aWNlXCI7XG5cbmV4cG9ydCBjb25zdCBwcm92aWRlT0F1dGgyID0gKFxuICAgIGNvbmZpZzogSU9BdXRoMkNvbmZpZyB8IG51bGwgPSBudWxsXG4pOiBFbnZpcm9ubWVudFByb3ZpZGVycyA9PlxuICAgIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXG4gICAgICAgIE9hdXRoMlNlcnZpY2UsXG4gICAgICAgIHsgcHJvdmlkZTogT0FVVEgyX0NPTkZJR19UT0tFTiwgdXNlVmFsdWU6IGNvbmZpZyB9LFxuICAgIF0pO1xuXG4iXX0=
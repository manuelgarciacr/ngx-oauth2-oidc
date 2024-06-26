import { catchError, lastValueFrom, tap } from "rxjs";
import { IOAuth2Config, IOAuth2Metadata } from "../domain";
import { mountUrl } from "./_mountUrl";
import { HttpClient } from "@angular/common/http";
import { setStore } from "./_store";

export const _fetchDiscoveryDoc = async (config: IOAuth2Config | null, http: HttpClient, discoveryDoc: IOAuth2Metadata | null) => {
    const discovery_endpoint = config?.configuration?.discovery_endpoint;
    const issuer = config?.metadata?.issuer;
    const sufix = config?.configuration?.well_known_sufix;
    const discoveryIsFeasible = discovery_endpoint ?? issuer;
    const no_discovery = config?.configuration?.no_discovery;

    if (!config)
        throw new Error(`No configuration defined.`, {
            cause: "oauth2 fetchDiscoveryDoc",
        });

    if (no_discovery) {
        console.error(
            `WARNING oauth2 fetchDiscoveryDoc: no_discovery is set to true`
        );
        return;
    }

    if (!discoveryIsFeasible)
        throw new Error(`discovery_endpoint or issuer is missing.`, {
            cause: "oauth2 fetchDiscoveryDoc",
        });

    const url = discovery_endpoint ?? mountUrl(issuer!, "https", sufix);

    // @ts-expect-error: Until HTMLFencedFrameElement is not experimental
    if (window.HTMLFencedFrameElement) {
        // TODO: Test use when not experimental
    }
    return lastValueFrom(
        http.get<IOAuth2Metadata>(url!).pipe(
            tap(res => {
                discoveryDoc = res;
                setStore("discoveryDoc", res);
                config.metadata = {
                    ...config.metadata,
                    ...res,
                };
                setStore("config", config);
            }),
            catchError(err => {
                throw err;
            })
        )
    );
};

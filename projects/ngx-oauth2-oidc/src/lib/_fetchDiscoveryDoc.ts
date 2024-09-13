import { catchError, lastValueFrom, map, tap } from "rxjs";
import { customParametersType, IOAuth2Config, IOAuth2Metadata, payloadType } from "../domain";
import { mountUrl } from "./_mountUrl";
import { HttpClient } from "@angular/common/http";
import { setStore } from "./_store";
import { debugFn } from "../utils";

/**
 * // TODO: no-storage configuration option
 * Request to the discovery endpoint. Returns the discovery document, saves
 *   the document inside the sessionStorage and saves the metadata in the
 *   configuration object (in memory and storage). HttpClient get request. In
 *   test mode, the promise returns an array with the metadata (or error) and
 *   the payload of the request. When testimg, the payload is also stored
 *   within sessionStorage.
 *
 * @param http HttpClient object
 * @param config In memory configuration object
 * @param options Custom parameters for the request. (together with the URL,
 *   they form the payload)
 * @returns Promise with the request response (metadata or error). In test mode
 *   the promise returns an array with the response (or error) and the request
 *   payload.
 */
export const _fetchDiscoveryDoc = async (
    http: HttpClient,
    config: IOAuth2Config, // Parameter passed by reference updated (config.metadata)
    options = <customParametersType>{}
): Promise<IOAuth2Metadata | [IOAuth2Metadata, payloadType]> => {
    // Configuration data
    const test = !!config.configuration?.test;
    const discovery_endpoint = config.configuration?.discovery_endpoint;
    const issuer = config.metadata?.issuer;
    const sufix = config.configuration?.well_known_sufix;
    const discoveryIsFeasible = discovery_endpoint ?? issuer;
    const URL = discovery_endpoint ?? mountUrl(issuer ?? "", "https", sufix ?? "");
    const payload = test ? ({ URL } as payloadType) : undefined;

    if (!discoveryIsFeasible) {
        const err = new Error(`discovery_endpoint or issuer is missing.`, {
            cause: `oauth2 fetchDiscoveryDoc`,
        });
        // TODO: no-storage configuration option
        setStore("test", {});
        throw test ? [err, {}] : err;
    }

    // @ts-expect-error: Until HTMLFencedFrameElement is not experimental
    if (window.HTMLFencedFrameElement) {
        // TODO: Test use when not experimental
    }

    // TODO: no-storage configuration option
    setStore("test", test ? payload : {});

    return lastValueFrom(
        http.get<IOAuth2Metadata>(URL!).pipe(
            tap(res => {
                debugFn(
                    "int",
                    "FETCHDISCOVERYDOC RES",
                    JSON.stringify(res, null, 4)
                );
                // TODO: no-storage configuration option
                setStore("discoveryDoc", res);
                config.metadata ??= {}; // Parameter passed by reference updated
                // TODO: metadata type check
                config.metadata = {
                    ...config.metadata,
                    ...res,
                };
                // TODO: no-storage configuration option
                setStore("config", config);
            }),
            map(res =>
                payload
                    ? ([res, payload] as [IOAuth2Metadata, payloadType])
                    : res
            ),
            catchError(err => {
                throw payload ? [err, payload] : err;
            })
        )
    );
};

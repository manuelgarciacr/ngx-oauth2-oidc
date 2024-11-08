import { customParametersType, IOAuth2Config, IOAuth2Metadata } from "../domain";
import { mountUrl } from "./_mountUrl";
import { HttpClient } from "@angular/common/http";
import { setStore } from "./_store";
import { request } from "./_request";

// TODO: no-storage configuration option

/**
 * Request to the discovery endpoint. Returns the discovery document and saves
 *   the metadata in the configuration object (in memory and storage). HttpClient
 *   get request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param http HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @param options Custom parameters for the request.
 * @returns Promise with the request response (IOAuth2Metadata or error)
 */
export const _fetchDiscoveryDoc = async (
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and updated (configuration.metadata)
    options = <customParametersType>{}
): Promise<IOAuth2Metadata> => {
    // Configuration data
    const test = config.configuration?.test;
    const discovery_endpoint = config.configuration?.discovery_endpoint;
    const issuer = config.metadata?.issuer ?? "";
    const sufix =
        config.configuration?.well_known_sufix ??
        ".well-known/openid-configuration";
    const discoveryIsFeasible = discovery_endpoint ?? issuer;
    const URL = discovery_endpoint ?? mountUrl(issuer, "https", sufix);

    // For testing purposes
    // const payload: customParametersType = !test
    //     ? {}
    //     : Object.entries(options).length
    //     ? { ...options }
    //     : { URL };

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    if (!discoveryIsFeasible)
        throw new Error(`discovery_endpoint or issuer is missing.`, {
            cause: `oauth2 fetchDiscoveryDoc`,
        });

    // @ts-expect-error: Until HTMLFencedFrameElement is not experimental
    if (window.HTMLFencedFrameElement) {
        // TODO: Test use when not experimental
    }

    // TODO: no-storage configuration option
    // setStore("test", payload);

    return request(
        "GET",
        URL,
        http,
        config,
        options,
        "discovery"
    ) as IOAuth2Metadata;

    // return lastValueFrom(
    //     http.get<IOAuth2Metadata>(URL!).pipe(
    //         tap(res => {
    //             debugFn(
    //                 "int",
    //                 "FETCHDISCOVERYDOC RES",
    //                 JSON.stringify(res, null, 4)
    //             );
    //             // TODO: no-storage configuration option
    //             setStore("discoveryDoc", res);
    //             config.metadata ??= {}; // Parameter passed by reference updated
    //             // TODO: metadata type check
    //             config.metadata = {
    //                 ...config.metadata,
    //                 ...res,
    //             };
    //             // TODO: no-storage configuration option
    //             setStore("config", config);
    //         }),
    //         map(res =>
    //             payload
    //                 ? ([res, payload] as [IOAuth2Metadata, payloadType])
    //                 : res
    //         ),
    //         catchError(err => {
    //             throw payload ? [err, payload] : err;
    //         })
    //     )
    // );
};

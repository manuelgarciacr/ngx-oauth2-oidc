import { customParametersType, IOAuth2Config, IOAuth2Metadata, workerRequest } from "../domain";
import { mountUrl } from "./_mountUrl";
import { HttpClient } from "@angular/common/http";
import { setStore } from "./_store";
import { request as fnRequest } from "./_request";
import { _setParameters } from "./_setParameters";
import { getParameters } from "./_getParameters";

// TODO: no-storage configuration option

/**
 * Request to the discovery endpoint. Returns the discovery document and saves
 *   the metadata in the configuration object (in memory and storage). HttpClient
 *   get request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object or worker request
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Metadata or error)
 */
export const _fetchDiscoveryDoc = async (
    request: HttpClient | workerRequest,
    config: IOAuth2Config, // Passed by reference and updated (configuration.metadata)
    customParameters = <customParametersType>{},
    url?: string
): Promise<IOAuth2Metadata> => {
    // Configuration options
    const test = config.configuration?.test;
    const discovery_endpoint = config.configuration?.discovery_endpoint;
    const sufix =
        config.configuration?.well_known_sufix ??
        ".well-known/openid-configuration";
    // Metadata fields
    const issuer = config.metadata?.issuer ?? "";
    // url
    url ??= discovery_endpoint ?? mountUrl(issuer, "https", sufix);
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("discovery", config),
        ...customParameters,
    });

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    if (!url)
        throw new Error(
            `The value of the 'url' option or the 'discovery_endpoint' configuration field or the 'issuer' metadata field is missing.`,
            {
                cause: `oauth2 fetchDiscoveryDoc`,
            }
        );

    // @ts-expect-error: Until HTMLFencedFrameElement is not experimental
    if (window.HTMLFencedFrameElement) {
        // TODO: Test use when not experimental
    }

    return fnRequest(
        "GET",
        url,
        request,
        config,
        parms,
        "discovery"
    ) as IOAuth2Metadata;
};

import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Methods, IOAuth2Parameters, customParametersType, jsonObjectType, payloadType, stringsObject, workerRequest } from "../domain";
import { debugFn } from "../utils";
import { httpRequest } from "./_httpRequest";
import { setStore } from "./_store";
import { Observable } from "rxjs";

/**
 * Request to an OAuth2 endpoint. Redirects to the endpoint or makes a HttpClient
 *   get or post request.
 *
 * @param method Request method ("""HREF" for redirection)
 * @param url Endpoint URL
 * @param {HttpClient | workerRequest} request- HttpClient object or worker request
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param customParameters OAuth2 parameters (standard and custom) for the request. (payload)
 * @param endpoint Endpoint name (for error messages and to determine the type of response)
 * @returns Promise with the request response (or error). In test mode the promise
 *      returns an array with the response (or error) and the request payload.
 */
export const request = async <T>(
    method: "HREF" | "GET" | "POST",
    url: string,
    request: HttpClient | workerRequest,
    config: IOAuth2Config, // Passed by reference and updated
    customParameters = <customParametersType>{},
    endpoint: keyof IOAuth2Methods
): Promise<IOAuth2Parameters | IOAuth2Metadata> => {
    debugFn("prv", "REQUEST", config, customParameters);

    const test = config.configuration?.test;
    const content_type =
        config.configuration?.content_type ??
        "application/x-www-form-urlencoded";
    const revocation_header = config.configuration?.revocation_header;
    const tokenHeader =
        endpoint === "revocation" && revocation_header
            ? {
                  Authorization: `Bearer ${customParameters["token"]}`
              }
            : undefined;
    const headersInit = {
        Accept: "application/json",
        "Content-Type": content_type,
        ...tokenHeader,
    };
    const headers = new HttpHeaders(headersInit);

    // TODO: no-storage configuration option
    setStore("test", test ? {} : null);

    if (!url) {
        const err = new Error(`missing endpoint.`, {
            cause: `oauth2 ${endpoint}`,
        });
        throw err;
    }

    if (revocation_header) delete customParameters["token"];

    const payload = {} as stringsObject;

    // options to params
    for (const key in customParameters) {
        let v = customParameters![key as keyof typeof customParameters]; // Option value
        Array.isArray(v) && (v = v.join(" ")); // String array to a string of space separated values.
        if (v || v === false) payload[key] = v.toString(); // If not nullish nor empty, added to params.
    }

    const params =  new HttpParams({ fromObject: payload})

    // For testing purposes
    if (test) {
        const data = Object.keys(payload).length
            ? payload
            : { "@URL": url };

        // TODO: no-storage configuration option
        setStore("test", data);
    }

    let req:
        | Observable<payloadType>
        | Observable<{ data: payloadType; error: jsonObjectType }>;

    if (request instanceof HttpClient){
        if (method == "HREF") {
            // Redirection
            const req = new HttpRequest<string>(method, url, null, {
                //headers,
                params
            });
            location.href = req.urlWithParams;
            return {};
        }
        // Http request
        req =
            method == "POST"
                ? request.post<payloadType>(url, "null", {
                    headers,
                    params,
                    observe: "body",
                })
                : request.get<payloadType>(url, {
                    headers,
                    params,
                    observe: "body",
                });
    } else {
        req = (request as workerRequest)({
            url,
            headers: headersInit,
            parameters: payload,
            body: null,
            method,
        }, endpoint)
    }

    return httpRequest(
        req,
        request instanceof HttpClient,
        config!,
        endpoint !== "discovery"
    );
};

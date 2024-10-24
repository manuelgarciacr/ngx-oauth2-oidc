import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Methods, IOAuth2Parameters, customParametersType, payloadType } from "../domain";
import { debugFn } from "../utils";
import { httpRequest } from "./_httpRequest";
import { setStore } from "./_store";

type strObject = {[key: string]: string};

// TODO: no-storage configuration option

/**
 * Request to an OAuth2 endpoint. Redirects to the endpoint or makes a HttpClient
 *   get or post request.
 *
 * @param method Request method ("""HREF" for redirection)
 * @param url Endpoint URL
 * @param {HttpClient} http- HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param options OAuth2 parameters (standard and custom) for the request. (payload)
 * @param endpoint Endpoint name (for error messages and to determine the type of response)
 * @returns Promise with the request response (or error). In test mode the promise
 *   returns an array with the response (or error) and the request payload.
 */
export const request = async <T>(
    method: "HREF" | "GET" | "POST",
    url: string,
    http: HttpClient,
    config: IOAuth2Config, // Passed by reference and updated
    options = <customParametersType>{},
    endpoint: keyof IOAuth2Methods
): Promise<IOAuth2Parameters | IOAuth2Metadata> => {
    debugFn("prv", "REQUEST", config, options);

    const test = config.configuration?.test;

    if (!url) {
        const err = new Error(`missing endpoint.`, {
            cause: `oauth2 ${endpoint}`,
        });
        // TODO: no-storage configuration option
        setStore("test", {});
        throw err;
    }

    let params = new HttpParams({ fromObject: {} }); // Empty HttpParams object

    // options to params
    for (const key in options) {
        let v = options![key as keyof typeof options]; // Option value
        Array.isArray(v) && (v = v.join(" ")); // String array to a string of space separated values.
        if (v || v === false) params = params.set(key, v.toString()); // If not nullish nor empty, added to params.
    }

    // Create payload from params
    // const payload = params.keys().reduce((obj, key) => {
    //     obj[key] = params.get(key)!;
    //     return obj;
    // }, {} as payloadType);

    // For testing purposes
    const payload: payloadType = !test
        ? {}
        : params.keys().length
        ? params.keys().reduce((obj, key) => {
              obj[key] = params.get(key)!;
              return obj;
          }, {} as payloadType)
        : { "@URL": url };

    const headers = new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    });

    // TODO: no-storage configuration option
    setStore("test", payload);

    if (method == "HREF") {
        // Redirection
        const req = new HttpRequest<string>(method, url, null, {
            //headers,
            params,
        });
        location.href = req.urlWithParams;
        return {};
    } else {
        // Http request
        const req =
            method == "POST"
                ? http.post<strObject>(url, params, {
                      headers,
                      observe: "body",
                  })
                : http.get<strObject>(url, {
                      headers,
                      params,
                      observe: "body",
                  });
        return httpRequest<IOAuth2Parameters | IOAuth2Metadata>(
            req,
            config!,
            endpoint !== "discovery"
        );
    }
};

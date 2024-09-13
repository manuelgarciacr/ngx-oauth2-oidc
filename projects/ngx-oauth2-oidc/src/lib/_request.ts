import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { IOAuth2Config, IOAuth2Methods, IOAuth2Parameters, customParametersType, payloadType } from "../domain";
import { debugFn } from "../utils";
import { httpRequest } from "./_httpRequest";
import { setStore } from "./_store";

type strObject = {[key: string]: string};

/**
 * Request to an OAuth2 endpoint. Redirects to the endpoint or makes a HttpClient
 *   get or post request. In test mode the promise returns an array with the
 *   response (or error) and the request payload.
 *
 * @param method Request method ("""HREF" for redirection)
 * @param url Endpoint URL
 * @param {HttpClient} http- HttpClient object
 * @param config In memory configuration object
 * @param options OAuth2 parameters (standard and custom) for the request. (payload)
 * @param endpoint Endpoint name (to document messages)
 * @returns Promise with the request response (or error). In test mode the promise
 *   returns an array with the response (or error) and the request payload.
 */export const request = async <T>(
    method: "HREF" | "GET" | "POST",
    url: string,
    http: HttpClient,
    config: IOAuth2Config,
    options = <customParametersType>{},
    endpoint: keyof IOAuth2Methods
): Promise<IOAuth2Parameters | [IOAuth2Parameters, payloadType]> => {
    debugFn("prv", "REQUEST", config, options);

    const test = config.configuration?.test;

    if (!url) {
        const err = new Error(`missing endpoint.`, {
            cause: `oauth2 ${endpoint}`,
        });
        // TODO: no-storage configuration option
        setStore("test", {});
        throw test ? [err, {}] : err;
    }

    let params = new HttpParams({ fromObject: {} }); // Empty HttpParams object

    // options to params
    for (const key in options) {
        let v = options![key as keyof typeof options]; // Option value
        Array.isArray(v) && (v = v.join(" ")); // String array to a string of space separated values.
        if (v) params = params.set(key, v.toString()); // If not nullish nor empty, added to params.
    }

    // Create payload from params
    const payload = params.keys().reduce((obj, key) => {
        obj[key] = params.get(key)!;
        return obj;
    }, {} as payloadType);

    const headers = new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    });

    // TODO: no-storage configuration option
    setStore("test", test ? payload : {});

    if (method == "HREF") {
        const req = new HttpRequest<string>(method, url, null, {
            //headers,
            params,
        });
        location.href = req.urlWithParams;
        return test
            ? [{} as IOAuth2Parameters, payload]
            : ({} as IOAuth2Parameters);
    } else {
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
        return httpRequest(req, config!, payload);
    }
};

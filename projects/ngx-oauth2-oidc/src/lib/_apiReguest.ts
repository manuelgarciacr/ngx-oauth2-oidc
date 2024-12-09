import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { customParametersType, IOAuth2Config, jsonObject, methodType, payloadType, stringsObject } from "../domain";
import { catchError, lastValueFrom } from "rxjs";
import { setStore } from "./_store";

export const _api_request = async <T>(
    request: HttpClient,
    config: IOAuth2Config,
    customParameters = <customParametersType>{},
    url?: string,
    method: methodType = "GET",
    jsonHeaders  = <jsonObject>{},
    body = <payloadType>{}
): Promise<T> => {
    const test = config.configuration?.test;
    const content_type =
        config.configuration?.content_type ??
        "application/x-www-form-urlencoded";
    const {access_token} = customParameters;
    const tokenHeader =
        access_token
            ? {
                  Authorization: `Bearer ${access_token}`,
              }
            : undefined;
    jsonHeaders = {...jsonHeaders};
    for (const key in jsonHeaders)  {
        jsonHeaders[key] = JSON.stringify(jsonHeaders[key]).replace(
            /^"|"$/g,
            ""
        );
    }
    const headersInit = {
        Accept: "application/json",
        "Content-Type": content_type,
        ...tokenHeader,
        ...jsonHeaders
    };
    const headers = new HttpHeaders(headersInit);

    setStore("test", test ? {} : null);

    if (!url) {
        const err = new Error(`missing endpoint.`, {
            cause: `oauth2 apiRequest`,
        });
        throw err;
    }

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

        setStore("test", data);
    }

    const req =
        method == "POST"
            ? request.post<T>(url, body, {
                  headers,
                  params,
                  observe: "body",
              })
            : request.get<T>(url, {
                  headers,
                  params,
                  observe: "body",
              });

    return lastValueFrom(
        req.pipe(
            catchError(err => {
                throw err;
            })
        )
    );
}

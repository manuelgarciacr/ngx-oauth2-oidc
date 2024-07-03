import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { IOAuth2Config, IOAuth2Configuration, customParametersType } from "../domain";
import { debugFn } from "../utils";
import { httpRequest } from "./_httpRequest";

export const request = async <T>(
    endpoint: keyof IOAuth2Configuration,
    method: string,
    request: string,
    url: string,
    http: HttpClient,
    config: IOAuth2Config,
    options = <customParametersType>{}
) => {
    debugFn("prv", "REQUEST", endpoint, config, options);

    if (!url) throw `oauth2 ${endpoint}: missing endpoint`;

    let params = new HttpParams({ fromObject: {} });

    for (const key in options) {
        let v = options![key as keyof typeof options];
        Array.isArray(v) && (v = v.join(" "));
        if (v) params = params.set(key, v.toString());
    }

    const headers = new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    });

    if (request == "href") {
        const req = new HttpRequest<T>(method, url, null, {
            //headers,
            params,
        });
        location.href = req.urlWithParams;
        return;
    } else {
        const req =
            method.toUpperCase() == "POST"
                ? http.post<T>(url, params, {
                      headers,
                      observe: "body",
                  })
                : http.get<T>(url, {
                      headers,
                      params,
                      observe: "body",
                  });
        return httpRequest(req, config!);
    }
};

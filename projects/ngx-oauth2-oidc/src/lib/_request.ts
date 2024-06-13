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
    options = <customParametersType>{} //: Partial<IOAuth2Parameters> = <IOAuth2Parameters>{}
) => {
    debugFn("prv", "REQUEST", endpoint, config, options);
    // const configuration = config?.configuration as oauth2Configuration;
    // const endpointType = endpoint == "refresh" ? "token" : endpoint;
    // const configParamsKey = (endpoint + "_params") as keyof oauth2Configuration;
    // const configCustomKey = (endpoint + "_custom") as keyof oauth2Configuration;
    // const metadataKey = (endpointType + "_endpoint") as keyof IOAuth2Metadata;
    // const request_params =
    //     (configuration[configParamsKey] as (keyof IOAuth2Parameters)[]) ??
    //     [];
    // const req_custom = configuration[configCustomKey] as customParameters;
    // const request_custom = {
    //     ...(req_custom ?? {}),
    //     ...(customParms ?? {}),
    // };
    // const endpointUrl = (config?.metadata[metadataKey] as string) ?? "";

    //if (!config) throw `oauth2 ${endpoint}: no configuration defined`;

    if (!url) throw `oauth2 ${endpoint}: missing endpoint`;

    // const parameters = config?.parameters ?? <IOAuth2Parameters>{};
    // const endpointConfig = config.configuration[
    //     endpoint
    // ] as customParametersType ?? {};
    let params = new HttpParams({ fromObject: {} });

    // for (const key in endpointConfig) {
    //     let v = endpointConfig[key]; // configuration value
    //     Array.isArray(v) && (v = v.join(" "));
    //     if (v) params = params.set(key, v.toString());
    // }

    for (const key in options) {
        let v = options![key as keyof typeof options]; // configuration value
        Array.isArray(v) && (v = v.join(" "));
        if (v) params = params.set(key, v.toString());
    }

    // if (Object.keys(parameters).length) {
    //     config.parameters = parameters;
    //     setStore("config", config);
    // }

    // for (const key in request_custom) {
    //     let v = request_custom[key];

    //     Array.isArray(v) && (v = v.join(" "));
    //     if (v) params = params.set(key, v.toString());
    // }

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

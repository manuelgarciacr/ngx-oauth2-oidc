import { Observable } from "rxjs";
import { authorizationGrantValues } from "..";

/** URL type */
export type urlType = string;

export type stringsObject = { [key: string]: string };

export type optionalStringsObject = { [key: string]: string | undefined };

export type jsonObject = { [key: string]: jsonObjectType };

export type jsonObjectType =
    | boolean
    | string
    | number
    | bigint
    | object
    | null
    | jsonObjectType[]
    | { [key: string]: jsonObjectType };

export type payloadType = jsonObjectType | Blob;

export type workerRequest = (
    options: {
        url: string;
        headers: jsonObject;
        parameters: stringsObject;
        body: payloadType;
        method: string;
    },
    listener?: Function | null | string
) => Observable<{ data: any; error: any }>;

/** Oauth2 parameter type */
export type parameterType = boolean | string | number | bigint | string[] | null;

/** Oauth2 custom parameters type */
export type customParametersType = {
    [key: string]: parameterType;
};

/** Authorization */
export type authorizationGrantType = typeof authorizationGrantValues[number];

export type methodType = "POST" | "GET" | "PUT" | "DELETE" | "PATCH";


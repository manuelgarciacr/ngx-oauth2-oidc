import { Observable } from "rxjs";

/** URL type */
export type urlType = string;
export type workerRequest = (
    options: {
        url: string;
        headers: payloadType;
        parameters: payloadType;
        body: unknown;
        method: string;
    },
    listener?: Function | null | string
) => Observable<{ data: any; error: any }>;
export type payloadType = { [key: string]: string };

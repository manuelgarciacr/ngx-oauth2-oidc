import { Observable, catchError, lastValueFrom, map } from "rxjs";
import { debugFn } from "../utils";
import { IOAuth2Config, payloadType } from "../domain";
import { convertParameters } from "./_convertParameters";
import { IOAuth2Parameters } from "ngx-oauth2-oidc";

type strObject = { [key: string]: string };

/**
 * Gets an HttpClient get or post request response. In test mode the promise
 *   returns an array with the response (or error) and the request payload.
 *
 * @param req HttpClient get or post method response (Observable)
 * @param config In memory configuration object
 * @param payload Request payload
 * @returns Promise with the request response (or error). In test mode the promise
 *   returns an array with the response (or error) and the request payload.
 */
export const httpRequest = (
    req: Observable<strObject>,
    config: IOAuth2Config,
    payload?: payloadType
): Promise<IOAuth2Parameters | [IOAuth2Parameters, payloadType]> => {
    debugFn("prv", "HTTP_REQUEST", req);

    return lastValueFrom(
        req.pipe(
            map(res => {
                const response = convertParameters(res, config);
                return payload
                    ? ([response, payload] as [IOAuth2Parameters, payloadType])
                    : res
            }),
            catchError(err => {
                throw payload ? [err, payload] : err;
            })
        )
    );
};

import { Observable, catchError, lastValueFrom, map } from "rxjs";
import { debugFn } from "../utils";
import { IOAuth2Config } from "../domain";
import { convertParameters } from "./_convertParameters";

/**
 * Gets an HttpClient get or post request response body and save the received parameters
 *
 * @param req HttpClient get or post method response (Observable)
 * @param config In memory configuration object
 * @returns HttpClient request response as a Promise
 */
export const httpRequest = <T>(req: Observable<T>, config: IOAuth2Config) => {
    debugFn("prv", "HTTP_REQUEST", req);

    return lastValueFrom(
        req.pipe(
            map(res => convertParameters(res as {[key: string]: string}, config)),
            catchError(err => {
                throw err
            })
        )
    );
};

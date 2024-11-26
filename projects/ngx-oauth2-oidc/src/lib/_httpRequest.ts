import { Observable, catchError, firstValueFrom, lastValueFrom, map, tap} from "rxjs";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Parameters, jsonObjectType, payloadType, stringsObject } from "../domain";
import { updateParameters } from "./_updateParameters";
import { updateMetadata } from "./_updateMetadata";

/**
 * Gets an HttpClient get or post request response. If "areParameters" is true (default)
 *   the response is converted to IOAuth2Parameters and actualizes config.parameters.
 *   Otherwise, the response actualizes config.metadata.
 *
 * @param request HttpClient get or post method response or worker response. (Observable)
 * @param isHttpClient OTrueif request is an HttpClient response.
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param areParameters If true (default), the response is converted to IOAuth2Parameters
 *      and actualizes config.parameters. If false, the response actualizes config.metadata
 * @returns Promise with the request response (or error).
 */
export const httpRequest = (
    request: Observable<payloadType> | Observable<{data: payloadType, error: jsonObjectType}>,
    isHttpClient: boolean,
    config: IOAuth2Config, // Passed by reference and updated
    areParameters = true
): Promise<IOAuth2Parameters | IOAuth2Metadata> => {
    if (isHttpClient) {
        return lastValueFrom(
            (request as Observable<payloadType>).pipe(
                map(res =>
                    areParameters
                        ? updateParameters(res as stringsObject, config)
                        : updateMetadata(res as stringsObject, config)
                ),
                catchError(err => {
                    throw err;
                })
            )
        );
    }

    return firstValueFrom(
        (
            request as Observable<{ data: payloadType; error: jsonObjectType }>
        ).pipe(
            tap(res => {
                if (res.error) throw res.error;
            }),
            map(res => res.data as payloadType),
            map(res =>
                areParameters
                    ? updateParameters(res as stringsObject, config)
                    : updateMetadata(res as stringsObject, config)
            ),
            catchError(err => {
                throw err;
            })
        )
    );
};

import { Observable, catchError, lastValueFrom, map} from "rxjs";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Parameters, payloadType, stringsObject } from "../domain";
import { updateParameters } from "./_updateParameters";
import { updateMetadata } from "./_updateMetadata";

/**
 * Gets an HttpClient get or post request response. If "areParameters" is true (default)
 *   the response is converted to IOAuth2Parameters and actualizes config.parameters.
 *   Otherwise, the response actualizes config.metadata.
 *
 * @param request HttpClient get or post method response. (Observable)
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param areParameters If true (default), the response is converted to IOAuth2Parameters
 *      and actualizes config.parameters. If false, the response actualizes config.metadata
 * @returns Promise with the request response (or error).
 */
export const httpRequest = (
    request: Observable<payloadType>,
    config: IOAuth2Config, // Passed by reference and updated
    areParameters = true
): Promise<IOAuth2Parameters | IOAuth2Metadata> =>
    lastValueFrom(
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

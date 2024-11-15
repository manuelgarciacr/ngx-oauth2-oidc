import { Observable, catchError, lastValueFrom, map} from "rxjs";
import { debugFn } from "../utils";
import { IOAuth2Config, IOAuth2Metadata, IOAuth2Parameters } from "../domain";
import { updateParameters } from "./_updateParameters";
import { updateMetadata } from "./_updateMetadata";

type strObject = { [key: string]: string };

/**
 * Gets an HttpClient get or post request response. If "areParameters" is true (default)
 *   the response is converted to IOAuth2Parameters and actualizes config.parameters.
 *   Otherwise, the response actualizes config.metadata.
 *
 * @param req HttpClient get or post method response (Observable)
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated
 * @param areParameters If true (default), the response is converted to IOAuth2Parameters
 *      and actualizes config.parameters. If false, the response actualizes config.metadata
 * @returns Promise with the request response (or error).
 */
export const httpRequest = <T>(
    req: Observable<strObject>,
    config: IOAuth2Config, // Passed by reference and updated
    areParameters = true
): Promise<IOAuth2Parameters | IOAuth2Metadata> => {
    debugFn("prv", "HTTP_REQUEST", req);

    return lastValueFrom(
        req.pipe(
            map(res => areParameters ?
                updateParameters(res, config) :
                updateMetadata(res, config)
            ),
            catchError(err => {
                console.error("HTTPREQUEST", err)
                throw err;
            })
        )
    );
};

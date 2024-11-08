import { JOSEError } from "jose/errors";
import { HttpErrorResponse } from "@angular/common/http";

export const _errorArray = (err: unknown): [string, any][] => {
    const isHttpError = err instanceof HttpErrorResponse;
    const isOAuth2Error = isHttpError && !!err.error.error;
    const isJOSEError = err instanceof JOSEError;

    const error: [string, any][] = isOAuth2Error
        ? [[err.error.error, err.error.error_description]]
        : isHttpError
        ? [
              [
                  (err as HttpErrorResponse).statusText,
                  (err as HttpErrorResponse).message,
              ],
          ]
        : isJOSEError
        ? [[(err as JOSEError).name, (err as JOSEError).message]]
        : (err as Error).cause
        ? [[(err as Error).cause, (err as Error).message]]
        : (err as Error).name
        ? [[(err as Error).name, (err as Error).message]]
        : typeof err == "object"
        ? Object.entries(err ?? {})
        : [[(err ?? "").toString(), ""]];
    return error;
};

import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable, tap } from "rxjs";

export function fragmentInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const url = req.url; // or event.url

    if (true)
        return next(req);

    const reqWithHeader = req.clone({
        headers: req.headers.set("X-New-Header", "new header value"),
    });
    return next(reqWithHeader).pipe(
        tap(event => {
            if (event.type === HttpEventType.Response) {
                const url = event.url ?? ""; // or event.url

            }
        })
    );
}

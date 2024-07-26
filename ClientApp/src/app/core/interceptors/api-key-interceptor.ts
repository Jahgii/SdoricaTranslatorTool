import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export function ApiKeyInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const reqWithKey = req.clone({
        setHeaders: { "stt-api-key": "HELLO" },
    });

    return next(reqWithKey);
}
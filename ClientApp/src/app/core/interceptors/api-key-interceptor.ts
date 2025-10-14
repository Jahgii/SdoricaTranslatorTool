import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export function ApiKeyInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {


    const reqWithKey = req.clone({
        headers: req.headers
            .append("stt-api-key", localStorage.getItem('apiKey') ?? "NOTPROVIDED")
            .append("Authorization", "Bearer " + localStorage.getItem('token'))
    });

    return next(reqWithKey);
}
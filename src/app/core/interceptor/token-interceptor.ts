import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Injectable, Injector} from '@angular/core';
import { of } from 'rxjs/observable/of';
import {UserService} from '../service/user.service';
import {NGXLogger} from 'ngx-logger';
import {mergeMap} from 'rxjs/operators';
import {catchError} from 'rxjs/operators';
import {NzMessageService} from 'ng-zorro-antd';
import {AppService, server} from '@core/service/app.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private injector: Injector) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // process path variable

        // clone http params
        const params = {};
        req.params.keys().forEach((key) => params[key] = req.params.get(key));
        // replace path variable
        const newUrl = req.url.replace(/:\w+/g, function (str) {
            const val = params[str.substr(1)];
            if (val) {
                delete params[str.substr((1))];
                return val;
            }
            return str;
        });
        const userSer = this.injector.get(UserService);
        const log = this.injector.get(NGXLogger);
        const msg = this.injector.get(NzMessageService);
        const appSrv = this.injector.get(AppService);
        // clone req
        req = req.clone({
            setHeaders: userSer.getTokenHeader(),
            url: newUrl,
            params: new HttpParams({ fromObject: params })
        });
        return next.handle(req).pipe(
            mergeMap((event: any) => {
                return of(event);
            }),
            catchError((err: any) => {
                log.error(err);
                if (err.status === 440) {
                    userSer.timeout();
                } else if (err.status === 403) {
                    userSer.needLogin();
                } else if (err.status === 500) {
                    msg.error('服务器内部错误');
                }
                return of(<any>{ res: err });
            })
        );
    }
}

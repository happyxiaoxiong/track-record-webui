import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';


@Injectable()
export class JsLoadService {
    private count = 0;
    private scriptLoadingPromise = [];

    constructor(private http: HttpClient) {
    }

    load(jsSrc: string) {
        const me = this;
        if (!me.scriptLoadingPromise[jsSrc]) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = jsSrc;
            document.body.appendChild(script);
            me.scriptLoadingPromise[jsSrc] = true;
        }
    }

    loadQqConvertor() {
        const me = this;
        const qqConvertor = server.apis.extra.qqConvertor;
        if (!me.scriptLoadingPromise[qqConvertor]) {
            me.scriptLoadingPromise[qqConvertor] = true;
            me.http.get(qqConvertor).subscribe((res: HttpRes) => {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.src = res.data.replace(/document.write([^;]);/g, function (str) {
                    return `var s = document.createElement('script');
                        s.type = 'text/javascript';
                        s.async = true;
                        s.defer = true;
                        s.src=src;
                        document.body.appendChild(s);`;
                });
                document.body.appendChild(script);
            });
        }
    }
}

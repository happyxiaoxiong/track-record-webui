import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';


@Injectable()
export class JsLoadService {

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
            document.head.appendChild(script);
            me.scriptLoadingPromise[jsSrc] = true;
        }
    }
    // trick to fix:Failed to execute 'write' on 'Document'. It isn't possible to write into a document from an asynchronously-loaded external script unless it is explicitly opened
    // loadQqConvertor() {
    //     const me = this;
    //     const qqConvertor = server.apis.extra.qqConvertor;
    //     if (!me.scriptLoadingPromise[qqConvertor]) {
    //         me.scriptLoadingPromise[qqConvertor] = true;
    //         me.http.get('http://map.qq.com/api/js?v=2.exp&libraries=convertor&key=IMZBZ-S7VRW-NXERI-RLSJY-HHHCT-MBFI4', { responseType: 'text'}).subscribe((res ) => {
    //             const script = document.createElement('script');
    //             script.type = 'text/javascript';
    //             script.async = true;
    //             script.defer = true;
    //             script.text = res.replace(/document.write[^;]+;/g, function (str) {
    //                 return `var s = document.createElement('script');
    //                     s.type = 'text/javascript';
    //                     s.async = true;
    //                     s.defer = true;
    //                     s.src=src;
    //                     document.body.appendChild(s);`;
    //             });
    //             document.body.appendChild(script);
    //         });
    //     }
    // }
}

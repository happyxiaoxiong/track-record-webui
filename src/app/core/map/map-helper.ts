import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {QQ_MAP_KEY} from '@core/service/app.service';

export abstract class AbstractMapHelper {
    abstract locate(map);
    abstract latLng(point: { lat: number, lng: number });
    abstract getDefaultOptions();
    abstract gps2MapLatLng(gps: any | Array<any>): Observable<any | Array<any>>;
    abstract mapLatLng2Gps(latLng: any | Array<any>): Observable<any | Array<any>>;
    abstract startMarker(latLng: any);
    abstract endMarker(latLng: any);
    textSearch(text: string, http: HttpClient): Observable<Array<{ location: { lat: number, lng: number }, title: string }>> {
        return Observable.fromPromise(new Promise((resolve, reject) => {
            http.jsonp(`http://apis.map.qq.com/ws/place/v1/suggestion?key=${QQ_MAP_KEY}&keyword=${text}&output=jsonp`, 'callback')
                .subscribe((res: any) => {
                    resolve((res.data || []).map((item) =>  {
                        const [gpsLng, gpsLat] = coordtransform.gcj02towgs84(item.location.lng, item.location.lat);
                        const title = `${item.title}(${item.address.indexOf(item.province) !== -1 ? item.address : `${item.province}${item.city}${item.district}${item.address}`})`;
                        return { location: { lat: gpsLat, lng: gpsLng }, title: title};
                    }));
                });
        }));
    }
}

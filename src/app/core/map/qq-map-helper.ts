import {AbstractMapHelper} from '@core/map/map-helper';
import {DEFAULT_MAP_CENTER} from '@core/service/app.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
declare const qq: any;
export class QqMapHelper extends AbstractMapHelper {
    locate(map) {
        // 获取城市列表接口设置中心点
        const cityLocation = new qq.maps.CityService({
            complete: function (result) {
                map.setCenter(result.detail.latLng);
            }
        });
        // 根据用户IP查询城市信息。
        cityLocation.searchLocalCity();
    }

    latLng(point: { lat: number; lng: number }): any {
        return new qq.maps.LatLng(point.lat, point.lng);
    }

    getDefaultOptions() {
        return {
            zoom: 12,
            center: this.latLng(DEFAULT_MAP_CENTER)
        };
    }

    gps2MapLatLng(gps: any | Array<any>): Observable<any | Array<any>> {
        return Observable.fromPromise(new Promise((resolve, reject) => {
                qq.maps.convertor.translate(gps, 1, function(res){
                    resolve(Array.isArray(res) ? res : res[0]);
                });
            }));

    }

    mapLatLng2Gps(latLng: any | Array<any>): Observable<any | Array<any>> {
        return Observable.fromPromise(new Promise((resolve, reject) => {
            if (Array.isArray(latLng)) {
                return resolve(latLng.forEach((item) => this.latLng2Gps(item)));
            } else {
                return resolve(this.latLng2Gps(latLng));
            }
        }));

    }

    private latLng2Gps(latLng: any) {
        const [gpsLng, gpsLat] = coordtransform.gcj02towgs84(latLng.lng, latLng.lat);
        return {
            lat: gpsLat,
            lng: gpsLng
        };
    }

    startMarker(latLng: any) {
        return this.tagMarker(latLng, 0, 0, -1);
    }

    endMarker(latLng: any) {
        return this.tagMarker(latLng, 0, 34);
    }

    private tagMarker(latLng, x, y, zIndex = -2) {
        return new qq.maps.Marker(
            {
                position: latLng,
                icon: new qq.maps.MarkerImage('/assets/img/markers.png', new qq.maps.Size(42, 34),
                    new qq.maps.Point(x, y)),
                zIndex: zIndex
            });
    }
}

import {Injectable} from '@angular/core';
declare const qq: any;

@Injectable()
export class MapService {
    gps2Tx(gpsPoints, callback: Function) {
        if (!gpsPoints || gpsPoints.length === 0) {// 不需要转换
            callback([]);
            return;
        }
        qq.maps.convertor.translate(gpsPoints, 1, function(res){
            callback(res);
        });
    }

    locateByIp(map, callback?: Function) {
        // 获取城市列表接口设置中心点
        const cityLocation = new qq.maps.CityService({
            complete : function(result){
                map.setCenter(result.detail.latLng);
                if (callback) {
                    callback();
                }
            }
        });
        // 根据用户IP查询城市信息。
        cityLocation.searchLocalCity();
    }
}

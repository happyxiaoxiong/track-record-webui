import {AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild} from '@angular/core';
import {AqmComponent} from 'angular-qq-maps';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {HistoryService} from '../history.service';
import {NzMessageService} from 'ng-zorro-antd';
import {HttpClient} from '@angular/common/http';
import {AppService, server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import {JsLoadService} from '@core/service/js-load.service';

declare const qq: any;

@Component({
    selector: 'app-track-history-map',
    template: `
        <aqm-map #qqMap fixWindow [minWidth]="0" (ready)="onReady($event)" ngClass="ant-card-bordered"></aqm-map>
    `
})
export class MapComponent implements OnDestroy, AfterViewInit {

    count = 0;
    private map: any;
    private tracks = [];

    @ViewChild('qqMap') mapComp: AqmComponent;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private el: ElementRef, private http: HttpClient, private historySrv: HistoryService,
                private msg: NzMessageService, private appSrv: AppService, private jsLoadSrv: JsLoadService) {
        this.jsLoadSrv.loadQqConvertor();
    }

    onReady(mapNative: any) {
        mapNative.setOptions({
            zoom: 12,
            center: new qq.maps.LatLng(39.916527, 116.397128)
        });
        this.map = mapNative;
    }

    ngAfterViewInit(): void {
        this.historySrv.getSwitchObservable().subscribe((track) => {
            if (track.checked) {
                this.showTrack(track);
            } else {
                this.hideTrack(track);
            }
        });
    }

    ngOnDestroy(): void {
        ['click'].forEach(eventName => {
            qq.maps.event.clearListeners(this.map, eventName);
        });
    }

    hideTrack(track) {
        this.count--;
        // this.tracks[track.id];
    }

    showTrack(track) {
        if (this.tracks[track.id]) {
            this.count++;
        } else {
            this.getTrackRoute(track);
        }
    }

    getTrackRoute(track) {
        track.loading = true;
        this.http.get(server.apis.track.route, {params: {id: track.id}}).subscribe((res: HttpRes) => {
            if (server.successCode === res.code) {
                const placeMarks = res.data.placeMarks || [];
                this.gps2Tx(placeMarks, function () {
                    const overlay = [];
                    placeMarks.filter(placeMark => placeMark.resPoint).forEach(placeMark => {
                        overlay.push(new qq.maps.Marker({position: placeMark.resPoint, map: this.map}));
                    });
                    placeMarks.filter(placeMark => placeMark.resPoints).for(placeMark => {
                        const style = placeMark.style || {};
                        const polyLineOptions = {
                            map: this.map,
                            path: placeMark.resPoints,
                            strokeColor: style.color || '#8A2BE2',
                            fillColor: '',
                            strokeWeight: parseInt(style.width || '3', 10)
                        };
                        overlay.push(new qq.maps.Polyline(polyLineOptions));
                    });
                    track.loading = false;
                });
                this.count++;
            } else {
                track.loadFailed = true;
                track.title = '加载失败';
            }
        });
    }

    // 坐标转换
    gps2Tx(placeMarks, fn: Function) {
        let count = placeMarks.length;
        // 路线转换
        placeMarks.filter(placeMark => placeMark.points).forEach(placeMark => {
            gps2Tx(placeMark.points.map(point => latLng(point)), (resPoints) => {
                count--;
                if (resPoints.length > 0) {
                    placeMark.resPoints = resPoints;
                }
                if (count <= 0) {// 所有坐标转换完毕
                    fn();
                }
            });
        });
        // 关键点转换
        const keyGpsPoints = placeMarks.filter(placeMark => placeMark.point).map(placeMark => latLng(placeMark.point));
        gps2Tx(keyGpsPoints, (resPoints) => {
            count -= keyGpsPoints.length;
            if (resPoints.length === keyGpsPoints.length) {// 转换成功
                let ind = 0;
                placeMarks.filter(placeMark => placeMark.point).forEach(placeMark => placeMark.resPoint = resPoints[ind++]);
            }
            if (count <= 0) {// 所有坐标转换完毕
                fn();
            }
        });
    }
}


function latLng(point) {
    return new qq.maps.LatLng(point.latitude, point.longitude);
}

function gps2Tx(gpsPoints, fn: Function) {
    if (!gpsPoints || gpsPoints.length === 0) {// 不需要转换
        fn([]);
        return;
    }
    qq.maps.convertor.translate(gpsPoints, 1, function(res){
        fn(res);
    });
}


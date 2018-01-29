import {AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AqmComponent} from 'angular-qq-maps';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {HistoryService} from '../history.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import {DescComponent} from './desc/desc.component';

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
    private trackOverlays = [];

    @ViewChild('qqMap') mapComp: AqmComponent;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private el: ElementRef, private http: HttpClient, private historySrv: HistoryService, private zone: NgZone,
                private msg: NzMessageService, private modal: NzModalService) {
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
        for (const i in this.trackOverlays) {
            this.trackOverlays[i].forEach(overlay => overlay.setMap(null));
            delete this.trackOverlays[i];
        }
        this.count = 0;
        ['click'].forEach(eventName => {
            qq.maps.event.clearListeners(this.map, eventName);
        });
    }

    clear() {
        this.count = 0;
        for (const i in this.trackOverlays) {
            this.trackOverlays[i].forEach(overlay => overlay.setMap(null));
        }
    }

    hideTrack(track) {
        const trackOverlays = this.trackOverlays[track.id];
        if (trackOverlays && trackOverlays.visible) {
            this.setOverlaysMap(trackOverlays, null);
            trackOverlays.visible = false;
            this.count--;
        }
    }

    showTrack(track) {
        const trackOverlays = this.trackOverlays[track.id];
        if (trackOverlays) {
            if (!trackOverlays.visible) {
                trackOverlays.visible = true;
                this.setOverlaysMap(trackOverlays.overlays, this.map);
                this.fitBounds(trackOverlays.overlays);
                this.count++;
                track.loading = false;
            }
        } else {
            track.loading = true;
            this.getTrackRoute(track);
        }
    }

    private setOverlaysMap(overlays, map) {
        overlays.forEach(overlay => overlay.setMap(map));
    }

    getTrackRoute(track) {
        const me = this;
        track.loading = true;
        this.http.get(server.apis.track.route, {params: {id: track.id}}).subscribe((res: HttpRes) => {
            if (server.successCode === res.code) {
                const placeMarks = res.data.placeMarks || [];
                this.gps2Tx(placeMarks, function () {
                    const overlays = [];
                    placeMarks.filter(placeMark => placeMark.resPoint).forEach(placeMark => {
                        const marker = new qq.maps.Marker({position: placeMark.resPoint});
                        overlays.push(marker);
                        qq.maps.event.addListener(marker, 'click', function () {
                            me.modal.open( {
                                width: '50%',
                                title: placeMark.name,
                                footer: false,
                                content: DescComponent,
                                    componentParams: {
                                        desc: placeMark.desc,
                                        gpsPoint: placeMark.point,
                                        id: track.id
                                    }
                                }
                            ); // 图片，视频展示
                        });
                    });
                    placeMarks.filter(placeMark => placeMark.resPoints).forEach(placeMark => {
                        const style = placeMark.style || {};
                        const path = placeMark.resPoints;
                        const polyLineOptions = {
                            path: path,
                            strokeColor: style.color || '#8A2BE2',
                            fillColor: '',
                            strokeWeight: parseInt(style.width || '3', 10)
                        };
                        overlays.push(new qq.maps.Polyline(polyLineOptions));
                        overlays.push(me.startMarker(path[0])); // 起点
                        overlays.push(me.endMarker(path[path.length - 1])); // 中点
                    });
                    me.trackOverlays[track.id] = {
                        overlays: overlays,
                        visible: false
                    };
                    me.showTrack(track); // 在地图上显示
                });
            } else {
                track.loadFailed = true;
                track.title = '加载失败';
                track.checked = false;
            }
        });
    }

    private fitBounds(overlays: Array<any>) {
        let bounds;
        overlays.forEach(overlay => {
            if (overlay.getBounds) {
                bounds = bounds ? bounds.union(overlay.getBounds()) : overlay.getBounds();
            }
        });
        if (bounds) {
            this.map.fitBounds(bounds);
        }
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

    startMarker(point) {
        return this.tagMarker(point, 0, 0, -1);
    }

    endMarker(point) {
        return this.tagMarker(point, 0, 34);
    }

    private tagMarker(point, x, y, zIndex = -2) {
        return new qq.maps.Marker(
            {
                position: point,
                icon: new qq.maps.MarkerImage('/assets/img/markers.png', new qq.maps.Size(42, 34),
                    new qq.maps.Point(x, y)),
                zIndex: zIndex
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


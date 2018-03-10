import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild} from '@angular/core';
import {AqmComponent} from 'angular-qq-maps';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {HistoryService} from '../history.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {HttpClient} from '@angular/common/http';
import {DEFAULT_MAP_CENTER, server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import {DescComponent} from '../desc/desc.component';
import {MapService} from '@core/service/map.service';
import {Observable} from 'rxjs/Observable';

declare const qq: any;

@Component({
    selector: 'app-track-history-qq-map',
    template: `
        <aqm-map #qqMap fixWindow [minWidth]="0" (ready)="onReady($event)" ngClass="ant-card-bordered"></aqm-map>
    `
})
export class QqMapComponent implements OnDestroy, AfterViewInit {

    autoAdjust = true;
    clickPoint;
    count = 0;
    private map: any;
    private trackOverlays = [];

    @ViewChild('qqMap') mapComp: AqmComponent;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private el: ElementRef, private http: HttpClient, private historySrv: HistoryService, private zone: NgZone,
                private msg: NzMessageService, private modal: NzModalService, private mapSrv: MapService) {
    }

    onReady(mapNative: any) {
        const me = this;
        mapNative.setOptions({
            zoom: 12,
            center: this.mapSrv.latLng(DEFAULT_MAP_CENTER)
        });
        me.map = mapNative;
        me.mapSrv.locate(me.map);

        me.historySrv.getSwitchObservable().subscribe((track) => {
            if (track.checked) {
                me.showTrack(track);
            } else {
                me.hideTrack(track);
            }
        });

        qq.maps.event.addListener(me.map, 'click', function (event) {
            me.mapSrv.mapLatLng2Gps(event.latLng).subscribe(res => me.clickPoint = res);
        });
    }

    ngAfterViewInit(): void {
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
            this.setOverlaysMap(this.trackOverlays[i].overlays, null);
            this.trackOverlays[i].visible = false;
        }
    }

    hideTrack(track) {
        const trackOverlay = this.trackOverlays[track.id];
        if (trackOverlay && trackOverlay.visible) {
            this.setOverlaysMap(trackOverlay.overlays, null);
            trackOverlay.visible = false;
            this.count--;
            this.fitBounds();
        }
    }

    showTrack(track) {
        const trackOverlay = this.trackOverlays[track.id];
        if (trackOverlay) {
            if (!trackOverlay.visible) {
                trackOverlay.visible = true;
                this.setOverlaysMap(trackOverlay.overlays, this.map);
                this.fitBounds();
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
                this.gps2Tx(placeMarks).subscribe(() => {
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
                        overlays.push(me.mapSrv.startMarker(path[0])); // 起点
                        overlays.push(me.mapSrv.endMarker(path[path.length - 1])); // 中点
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

    private fitBounds() {
        if (this.autoAdjust) {
            let bounds;
            for (const i in this.trackOverlays) {
                if (this.trackOverlays[i].visible) {
                    this.trackOverlays[i].overlays.forEach(overlay => {
                        if (overlay.getBounds) {
                            bounds = bounds ? bounds.union(overlay.getBounds()) : overlay.getBounds();
                        }
                    });
                }
            }
            if (bounds) {
                this.map.fitBounds(bounds);
            }
        }
    }
    // 坐标转换
    gps2Tx(placeMarks): Observable<void> {
        return Observable.fromPromise<void>(new Promise((resolve, reject) => {
            let count = placeMarks.length;
            // 路线转换
            placeMarks.filter(placeMark => placeMark.points).forEach(placeMark => {
                this.mapSrv.gps2MapLatLng(placeMark.points.map(point => this.mapSrv.latLng(point))).subscribe((resPoints) => {
                    count--;
                    if (resPoints.length > 0) {
                        placeMark.resPoints = resPoints;
                    }
                    if (count <= 0) {// 所有坐标转换完毕
                        resolve();
                    }
                });
            });
            // 关键点转换
            const keyGpsPoints = placeMarks.filter(placeMark => placeMark.point).map(placeMark => this.mapSrv.latLng(placeMark.point));
            this.mapSrv.gps2MapLatLng(keyGpsPoints).subscribe((resPoints) => {
                count -= keyGpsPoints.length;
                if (resPoints.length === keyGpsPoints.length) {// 转换成功
                    let ind = 0;
                    placeMarks.filter(placeMark => placeMark.point).forEach(placeMark => placeMark.resPoint = resPoints[ind++]);
                }
                if (count <= 0) {// 所有坐标转换完毕
                    resolve();
                }
            });
        }));
    }
}


import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild} from '@angular/core';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {HistoryService} from '../history.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import {DescComponent} from '../desc/desc.component';
import {GoogleMapsService} from 'google-maps-angular2';
import {MapService} from '@core/service/map.service';

declare const google: any;

@Component({
    selector: 'app-track-history-google-map',
    template: `
        <div id="historyGoogleMap" fixWindow [minWidth]="0" ngClass="ant-card-bordered"></div>
    `
})
export class GoogleMapComponent implements OnDestroy, AfterViewInit {

    autoAdjust = true;
    clickPoint;
    count = 0;
    private map: any;
    private trackOverlays = [];

    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private el: ElementRef, private http: HttpClient, private historySrv: HistoryService, private zone: NgZone,
                private msg: NzMessageService, private modal: NzModalService, private gapi: GoogleMapsService, private mapSrv: MapService) {
    }

    ngAfterViewInit(): void {
        const me = this;
        try {
            me.loadMap();
        } catch (ex) {
            this.gapi.init.then(() => {
                me.loadMap();
            });
        }
    }

    loadMap() {
        const me = this;
        me.map = new google.maps.Map(document.getElementById('historyGoogleMap'), me.mapSrv.getDefaultOptions());
        google.maps.event.addListener(me.map, 'click', function (event) {
            me.zone.run(() => {
                console.log(event);
                me.clickPoint = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
            });
        });
        me.mapSrv.locate(this.map);
        me.historySrv.getSwitchObservable().subscribe((track) => {
            if (track.checked) {
                me.showTrack(track);
            } else {
                me.hideTrack(track);
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
            google.maps.event.clearListeners(this.map, eventName);
        });
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
                const overlays = [];
                placeMarks.filter(placeMark => placeMark.point).forEach(placeMark => {
                    const marker = new google.maps.Marker({position: this.mapSrv.latLng(placeMark.point)});
                    overlays.push(marker);
                    google.maps.event.addListener(marker, 'click', function () {
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
                placeMarks.filter(placeMark => placeMark.points).forEach(placeMark => {
                    const style = placeMark.style || {};
                    const path = placeMark.points.map(point => this.mapSrv.latLng(point));
                    const polyLineOptions = {
                        path: path,
                        strokeColor: style.color || '#8A2BE2',
                        strokeWeight: parseInt(style.width || '3', 10)
                    };
                    overlays.push(new google.maps.Polyline(polyLineOptions));
                    overlays.push(me.mapSrv.startMarker(path[0])); // 起点
                    overlays.push(me.mapSrv.endMarker(path[path.length - 1])); // 中点
                });
                me.trackOverlays[track.id] = {
                    overlays: overlays,
                    visible: false
                };
                me.showTrack(track); // 在地图上显示
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
}



/*/<reference path="../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>*/
import {MapService} from '@core/service/map.service';
import {Component} from '@angular/core';

@Component({
    selector: 'app-realtime-position',
    template: `
        <app-realtime-position-google-map *ngIf="mapSrv.isGoogle()"></app-realtime-position-google-map>
        <app-realtime-position-qq-map *ngIf="mapSrv.isQq()"></app-realtime-position-qq-map>
    `
})
export class RealtimePositionComponent {

    constructor(private mapSrv: MapService) {
    }

}

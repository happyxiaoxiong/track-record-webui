import {Injectable} from '@angular/core';
import {IMapHelper} from '@core/map/map-helper';
import {GoogleMapHelper} from '@core/map/google-map-helper';
import {QqMapHelper} from '@core/map/qq-map-helper';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class MapService implements IMapHelper {

    constructor(private mapHelper: IMapHelper) {

    }

    locate(map) {
        this.mapHelper.locate(map);
    }

    latLng(point: { lat: number; lng: number }) {
        return this.mapHelper.latLng(point);
    }

    getDefaultOptions() {
        return this.mapHelper.getDefaultOptions();
    }

    gps2MapLatLng(gps: any | Array<any>): Observable<any | Array<any>> {
        return this.mapHelper.gps2MapLatLng(gps);
    }

    mapLatLng2Gps(latLng: any | Array<any>): Observable<any | Array<any>> {
        return this.mapHelper.mapLatLng2Gps(latLng);
    }

    startMarker(latLng: any) {
        return this.mapHelper.startMarker(latLng);
    }

    endMarker(latLng: any) {
        return this.mapHelper.endMarker(latLng);
    }

    textSearch(text: string, http?: HttpClient, map?: any): Observable<Array<any>> {
        return this.mapHelper.textSearch(text, http, map);
    }

    isGoogle() {
        return this.mapHelper instanceof GoogleMapHelper;
    }

    isQq() {
        return this.mapHelper instanceof QqMapHelper;
    }
}

import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

export interface IMapHelper {
    locate(map);
    latLng(point: { lat: number, lng: number });
    getDefaultOptions();
    gps2MapLatLng(gps: any | Array<any>): Observable<any | Array<any>>;
    mapLatLng2Gps(latLng: any | Array<any>): Observable<any | Array<any>>;
    startMarker(latLng: any);
    endMarker(latLng: any);
    textSearch(text: string, http?: HttpClient, map?: any): Observable<Array<{ location: { lat: number, lng: number }, title: string }>>;
}

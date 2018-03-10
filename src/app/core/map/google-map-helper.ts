import {IMapHelper} from '@core/map/map-helper';
import {DEFAULT_MAP_CENTER, QQ_MAP_KEY} from '@core/service/app.service';
import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

declare const google: any;

export class GoogleMapHelper implements IMapHelper {

    private searchService;

    locate(map) {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                map.setCenter(this.latLng({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
            });
        }
        // trick
        if (!google.maps.Polyline.prototype.getBounds) {
            google.maps.Polyline.prototype.getBounds = function () {
                const bounds = new google.maps.LatLngBounds();
                this.getPath().forEach(function (item) {
                    bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
                });
                return bounds;
            };
        }
    }

    latLng(point: { lat: number, lng: number }) {
        return new google.maps.LatLng(point.lat, point.lng);
    }

    getDefaultOptions() {
        return {
            zoom: 13,
            scrollwheel: true,
            panControl: true,
            mapTypeControl: true,
            zoomControl: true,
            streetViewControl: true,
            scaleControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            center: this.latLng(DEFAULT_MAP_CENTER)
        };
    }

    gps2MapLatLng(gps: any | Array<any>): Observable<any | Array<any>> {
        return Observable.of(gps);
    }
    mapLatLng2Gps(latLng: any | Array<any>): Observable<any | Array<any>> {
        return Observable.of(latLng);
    }

    startMarker(latLng: any) {
        return this.tagMarker(latLng, 's', 0);
    }

    endMarker(latLng: any) {
        return this.tagMarker(latLng, 'e', 34);
    }

    private tagMarker(point, tag, zIndex = -2) {
        return new google.maps.Marker(
            {
                position: point,
                icon: {
                    url: `/assets/img/${tag}.png`,
                    size: new google.maps.Size(26, 43),
                    origin:  new google.maps.Point(0, 0)
                },
                zIndex: zIndex
            });
    }

    textSearch(text: string, http?: HttpClient, map?: any): Observable<Array<{ location: { lat: number, lng: number }, title: string }>> {
        if (!this.searchService) {
            this.searchService = new google.maps.places.PlacesService(map);
        }
        return Observable.fromPromise(new Promise((resolve, reject) => {
            this.searchService.textSearch({
                query: text
            }, (res, status) => {
                resolve((status === google.maps.places.PlacesServiceStatus.OK ? res : []).map((item: any) => ({
                    location: { lat: item.geometry.location.lat(), lng: item.geometry.location.lng() },
                    title: item.name
                })));
            });
        }));
    }
}

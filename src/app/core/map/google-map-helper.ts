import {AbstractMapHelper} from '@core/map/map-helper';
import {DEFAULT_MAP_CENTER} from '@core/service/app.service';
import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';

declare const google: any;

export class GoogleMapHelper extends AbstractMapHelper {

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
}

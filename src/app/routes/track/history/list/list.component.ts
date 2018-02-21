import {Component, ElementRef, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import * as moment from 'moment';
import {HistoryService} from '../history.service';

@Component({
    selector: 'app-track-history-list',
    templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

    dateRange = [null, null];
    params: any = {
        pageSize: 10,
        distance: 0.5
    };
    tracks: any = [];
    trackTotal = 0;
    loading = false;
    positionExpand = false;

    constructor(
        private ref: ElementRef,
        private http: HttpClient,
        private historySrv: HistoryService
    ) { }

    ngOnInit() {
        this.search();
    }

    search() {
        this.loading = true;
        this.params.startTime = this.dateRange[0] ? moment(this.dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : '';
        this.params.endTime = this.dateRange[1] ? moment(this.dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : '';

        const params = Object.assign({}, this.params);
        if (!this.positionExpand) {
            delete params.latitude;
            delete params.longitude;
            delete params.distance;
        }
        this.http.get(server.apis.track.search, {params: params}).subscribe({ next: (res: HttpRes) => {
                const data = res.data || {};
                this.tracks = data.list || [];
                this.trackTotal = data.total || 0;
            }, complete: () => {
                this.loading = false;
            } });
    }

    reset() {
        this.params = {
            pageSize: this.params.pageSize,
            distance: 0.5
        };
        this.search();
    }


    pageSizeChange(pageSize) {
        this.params.pageSize = pageSize;
        this.search();
    }

    pageIndexChangeClick(pageNum) {
        this.params.pageNum = pageNum;
        this.search();
    }

    toggle(track, checked) {
        if (track.loadFailed) {
            return;
        }
        track.checked = checked;
        track.title = (checked ? '取消' : '选中') + '在地图上显示';
        this.historySrv.notifySwitch(track);
    }

    selectAll() {
        this.tracks.forEach((track) => {
            if (track.checked !== true) {
                this.toggle(track, true);
            }
        });
    }

    unSelectAll() {
        this.tracks.forEach((track) => {
            if (track.checked === true) {
                this.toggle(track, false);
            }
        });
    }

    toggleAll() {
        this.tracks.forEach((track) => {
            this.toggle(track, !track.checked);
        });
    }

    positiveNumberBlur(key, errorValue = 0.5) {
        this.params[key] = parseFloat(this.params[key]);
        if (isNaN(this.params[key]) || this.params[key] <= 0) {
            this.params[key] = errorValue;
        }
    }
}

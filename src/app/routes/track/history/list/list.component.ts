import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import * as moment from 'moment';
import {HistoryService} from '../history.service';
import {saveAs} from 'file-saver/FileSaver';
import 'rxjs/add/operator/map';
import {NzSelectComponent} from 'ng-zorro-antd';
import {UserService} from '@core/service/user.service';
import {MapService} from '@core/service/map.service';
import {Utils} from '@shared/utils';
import 'rxjs/add/operator/finally';

@Component({
    selector: 'app-track-history-list',
    templateUrl: './list.component.html',
    styles: [`
       :host ::ng-deep  .ant-calendar-picker {
            display: block;
        }
    `]
})
export class ListComponent implements OnInit {

    dateRange = {
        startTime: null,
        endTime: null
    };
    params: any = {
        pageSize: 10,
        distance: 0.5
    };
    tracks: any = [];
    trackTotal = 0;
    loading = false;
    positionExpand = false;
    searchTip = '';

    constructor(private http: HttpClient,
                private userSrv: UserService,
                private historySrv: HistoryService,
                private mapSrc: MapService) {
    }

    ngOnInit() {
        this.search();
    }

    search() {
        this.params.pageNum = 1;
        this._search();
    }

    _search() {
        this.loading = true;
        this.params.startTime = this.dateRange.startTime ? moment(this.dateRange.startTime).format('YYYY-MM-DD HH:mm:ss') : '';
        this.params.endTime = this.dateRange.endTime ? moment(this.dateRange.endTime).format('YYYY-MM-DD HH:mm:ss') : '';

        const params = {...this.params};
        if (!this.positionExpand) {
            delete params.lat;
            delete params.lng;
            delete params.distance;
        }
        this.http.get(server.apis.track.search, {params: params})
            .finally(() => this.loading = false)
            .subscribe(
                (res: HttpRes) => {
                    const data = res.data || {};
                    this.tracks = data.list || [];
                    this.trackTotal = data.total || 0;
                });
    }

    reset() {
        this.params = {
            pageSize: this.params.pageSize,
            distance: 0.5
        };
        this._search();
    }


    pageSizeChange(pageSize) {
        this.params.pageSize = pageSize;
        this._search();
    }

    pageIndexChangeClick(pageNum) {
        this.params.pageNum = pageNum;
        this._search();
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

    downloadUrl(track) {
        return Utils.urlParams(server.apis.track.download.replace(':id', track.id), this.userSrv.getTokenQuery());
    }

    searchAddressOptions = [];
    @ViewChild(NzSelectComponent) addressComp;

    addressSearchChange(keyword) {
        this.searchTip = '正在查询中...';
        this.mapSrc.textSearch(keyword, this.http).finally(() => this.searchTip =  '未查找到相关地点')
            .subscribe((res: any) => {
                this.searchAddressOptions = res;
            });
    }

    positionExpandChange() {
        this.positionExpand = !this.positionExpand;
        if (this.positionExpand) {
            setTimeout(() => {
                this.addressComp.registerOnChange((poi: any) => {
                    this.params.lat = poi.location.lat;
                    this.params.lng = poi.location.lng;
                });
            }, 1000);
        }
    }

    startTimeChange(time) {
        this.dateRange.startTime = time;
        if (this.dateRange.startTime > this.dateRange.endTime) {
            this.dateRange.endTime = null;
        }
    }

    endTimeChange(time) {
        this.dateRange.endTime = time;
        if (this.dateRange.startTime > this.dateRange.endTime) {
            this.dateRange.startTime = null;
        }
    }

    disabledStartTime = (time) => {
        if (!time || !this.dateRange.endTime) {
            return false;
        }
        return time.getTime() >= this.dateRange.endTime.getTime();
    }

    disabledEndTime = (time) => {
        if (!time || !this.dateRange.startTime) {
            return false;
        }
        return time.getTime() <= this.dateRange.startTime.getTime();
    }
}

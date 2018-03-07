import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import * as moment from 'moment';
import {HistoryService} from '../history.service';
import { saveAs } from 'file-saver/FileSaver';
import 'rxjs/add/operator/map';
import {NzMessageService} from 'ng-zorro-antd';
import {UserService} from '@core/service/user.service';

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
        private http: HttpClient,
        private userSrv: UserService,
        private historySrv: HistoryService,
        private msg: NzMessageService
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

    // download(track) {
    //     track.downLoading = true;
    //     this.http.get(server.apis.track.download, {
    //         params: { id: track.id },
    //         responseType: 'arraybuffer'
    //     }).subscribe((res) => {
    //         // const contentDispositionHeader: string = res.headers.get('Content-Disposition');
    //         // const parts: string[] = contentDispositionHeader.split(';');
    //         // const filename = parts[1].split('=')[1];
    //         const blob = new Blob([res], { type: 'application/octet-stream' });
    //         saveAs(blob, track.filename);
    //     }, () => {
    //         this.msg.error(`${track.name} 下载出错`);
    //     }, () => {
    //         track.downLoading = false;
    //     });
    // }

    downloadUrl(track) {
        const header = this.userSrv.getTokenHeader();
        let url = server.apis.track.download.replace(':id', track.id) + '?';
        for (const param in header) {
            if (header.hasOwnProperty(param)) {
                url += param + '=' + header[param];
            }
        }
        return url;
    }
}

import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {AppService, server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import 'rxjs/add/operator/takeWhile';
import {FileUploadService} from '../file-upload.service';

@Component({
    selector: 'app-last-week-state',
    template: `
        <nz-card nzTitle="最近一周轨迹文件上传状态">
            <ng-template #extra>
                <form nz-form [nzLayout]="'inline'">
                    <div nz-form-item>
                        <div nz-form-control>
                            <nz-input [ngClass]="{ 'ng-ant-input': searchValue.length > 0}"  [disabled]="loading" [(ngModel)]="searchValue" [ngModelOptions]="{standalone: true}" (keydown.enter)="search()">
                                <ng-template #suffix>
                                    <i class="ng-ant-input-clear anticon anticon-cross-circle" *ngIf="searchValue.length > 0" (click)="reset()"></i>
                                </ng-template>
                            </nz-input>
                        </div>
                    </div>
                    <div nz-form-item>
                        <div nz-form-control>
                            <button nz-button [nzType]="'primary'" [nzLoading]="loading" [disabled]="loading" (click)="search()"><i class="fa fa-search"></i><span>搜索</span></button>
                        </div>
                    </div>
                </form>
            </ng-template>
            <nz-table #nzTable [nzDataSource]="_displayTrackFiles" [nzSize]="'small'" [nzCustomNoResult]="false" [nzLoading]="loading"
                      [nzIsPagination]="true" [nzShowSizeChanger]="true" [nzShowTotal]="true" [nzIsPageIndexReset]="false">
                <thead nz-thead>
                <tr>
                    <th nz-th><span>文件名称<nz-table-sort [nzValue]="sortMap.filename" (nzValueChange)="sortChange('filename', $event)"></nz-table-sort></span></th>
                    <th nz-th><span>文件大小<nz-table-sort [nzValue]="sortMap.fileSize" (nzValueChange)="sortChange('fileSize', $event)"></nz-table-sort></span></th>
                    <th nz-th><span>文件md5</span></th>
                    <th nz-th><span>上传状态<nz-table-sort [nzValue]="sortMap.state" (nzValueChange)="sortChange('state', $event)"></nz-table-sort></span></th>
                    <th nz-th><span>说明</span></th>
                    <th nz-th><span>上传时间<nz-table-sort [nzValue]="sortMap.uploadTime" (nzValueChange)="sortChange('uploadTime', $event)"></nz-table-sort></span></th>
                </tr>
                </thead>
                <tbody nz-tbody>
                <tr nz-tbody-tr *ngFor="let trackFile of nzTable.data">
                    <td nz-td><strong>{{ trackFile.filename }}</strong></td>
                    <td nz-td>{{ trackFile.fileSize | byteFormat }}</td>
                    <td nz-td>{{ trackFile.md5 }}</td>
                    <td nz-td>
                        <span><nz-tag [nzColor]="stateTag(trackFile.state)">{{ trackFile.state }}</nz-tag></span>
                    </td>
                    <td nz-td>{{ trackFile.comment }}</td>
                    <td nz-td>{{ trackFile.uploadTime }}</td>
                </tr>
                </tbody>
            </nz-table>
        </nz-card>`,
    styles: [`
        .ng-ant-input-clear {
            opacity: 0;
            z-index: 1;
            color: rgba(0, 0, 0, 0.25);
            background: #fff;
            pointer-events: none;
            cursor: pointer;
        }
        .ng-ant-input-clear:hover {
            color: rgba(0, 0, 0, 0.43);
        }
        .ng-ant-input:hover .ng-ant-input-clear {
            opacity: 1;
            pointer-events: auto;
        }
    `]
})
export class LastWeekStateComponent implements OnInit, AfterViewInit, OnDestroy {

    loading = false;
    alive = false;
    _displayTrackFiles: any = [];
    trackFiles: any = [];

    timer;
    interval = 5000;

    searchValue = '';
    sortMap = {
        filename: null,
        fileSize: null,
        state: null,
        uploadTime: 'descend',
    };
    sortName = 'uploadTime';
    sortValue = 'descend';

    constructor(private http: HttpClient, private appSrv: AppService, private fileUploadSrv: FileUploadService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.startSyncDt();
        this.fileUploadSrv.getFileUploadedObservable().subscribe(() => {
           this.startSyncDt();
        });
    }

    ngOnDestroy(): void {
        this.alive = false;
        if (this.timer) {
            this.timer.unsubscribe();
            this.timer = null;
        }
    }

    stateTag(state: string) {
        if (state === '完成') {
            return 'green';
        } else if (state.endsWith('...')) {
            return 'orange';
        }
        return 'red';
    }

    startSyncDt() {
        if (!this.alive) {
            this.alive = true;
            this.timer = TimerObservable.create(0, this.interval).takeWhile(() => this.alive)
                .subscribe(() => {
                    let err = true;
                    this.http.get(server.apis.track.uploadState).finally(() => {
                        if (err) {
                            this.ngOnDestroy();
                        }
                    }).subscribe(((res: HttpRes) => {
                        res.data = res.data || [];
                        // 验证数据有无更新
                        if (this.trackFiles.length === res.data.length || this.trackFiles.length === 0) {
                            let needSync = false, hasUpdate = false;
                            for (let i = 0; i < this.trackFiles.length; i++) {
                                if (res.data[i].state.endsWith('...')) {
                                    needSync = true; // track need wait update
                                }
                                if (this.trackFiles.length !== 0 && res.data[i].state !== this.trackFiles[i].state) {
                                    // trackFiles add tips, track file state update
                                    hasUpdate = true;
                                }
                            }
                            if (!needSync) {// 不需要在同步了
                                this.ngOnDestroy();
                            }
                            if (!hasUpdate && this.trackFiles.length === res.data.length) {// 无更新
                                return;
                            }
                        }
                        this.trackFiles = res.data;
                        this.search();
                        err = false;
                    }));
                });
        }
    }


    sortChange(name, $event) {
        this.sortName = name;
        this.sortValue = $event;

        Object.keys(this.sortMap).forEach(key => {
            if (key !== name) {
                this.sortMap[key] = null;
            } else {
                this.sortMap[key] = $event;
            }
        });
        this.search();
    }

    search() {
        this.loading = true;
        this._displayTrackFiles = [...this.trackFiles].filter((trackFile) => {
            return this.searchValue.length > 0 ? (trackFile.filename.indexOf(this.searchValue) !== -1
                || trackFile.md5.indexOf(this.searchValue) !== -1 || trackFile.state.indexOf(this.searchValue) !== -1
                || trackFile.comment.indexOf(this.searchValue) !== -1 || trackFile.uploadTime.indexOf(this.searchValue) !== -1
                || trackFile.fileSize.toString().indexOf(this.searchValue)) !== -1 : true;
        });
        if (this.sortValue) {
            this._displayTrackFiles = [...this._displayTrackFiles.sort((a, b) => {
                if (a[this.sortName] > b[this.sortName]) {
                    return (this.sortValue === 'ascend') ? 1 : -1;
                } else if (a[this.sortName] < b[this.sortName]) {
                    return (this.sortValue === 'ascend') ? -1 : 1;
                } else {
                    return 0;
                }
            })];
        }
        this.loading = false;
    }
    reset() {
        this.searchValue = '';
        this.search();
    }
}

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {UserService} from '@core/service/user.service';
import {NGXLogger} from 'ngx-logger';
import {AppService, server} from '@core/service/app.service';
import {NzMessageService} from 'ng-zorro-antd';
import {FileUploadService} from '../file-upload.service';

@Component({
  selector: 'app-track-file-upload',
  template: `<nz-card nzTitle="轨迹文件上传">
      <nz-table id="track-table" #nzTable [nzDataSource]="uploader.files" [nzSize]="'small'" [nzCustomNoResult]="true"
                [nzIsPagination]="false" >
          <div noResult>把文件拖到这里。</div>
          <thead nz-thead>
          <tr>
              <th nz-th><span>文件名</span></th>
              <th nz-th><span>上传进度</span></th>
              <th nz-th><span>上传状态</span></th>
              <th nz-th><span>文件大小</span></th>
              <th nz-th><span></span></th>
          </tr>
          </thead>
          <tbody nz-tbody>
          <tr nz-tbody-tr *ngFor="let file of nzTable.data">
              <td nz-td><strong>{{ file.name }}</strong></td>
              <td nz-td>
                  <nz-progress [ngModel]="file.percent" [nzStrokeWidth]="5"></nz-progress>
              </td>
              <td nz-td>
                  <span *ngIf="file.status === DONE"><nz-tag [nzColor]="'green'">上传成功</nz-tag></span>
                  <span *ngIf="file.status === FAILED"><nz-tag [nzColor]="'red'">上传失败</nz-tag></span>
                  <span *ngIf="file.status === QUEUED"><nz-tag [nzColor]="'orange'">等待上传</nz-tag></span>
                  <span *ngIf="file.status === UPLOADING"><nz-tag [nzColor]="'orange'">正在上传</nz-tag></span>
              </td>
              <td nz-td nowrap>{{ file.size | byteFormat }}</td>
              <td nz-td nowrap>
                  <button nz-button *ngIf="file.status !== UPLOADING && file.status !== DONE" (click)="uploader.removeFile(file)">
                      <i class="anticon anticon-delete"></i><span>删除</span>
                  </button>
              </td>
          </tr>
          </tbody>
      </nz-table>
      <nz-button-group class="mt-md d-block">
          <button id="select_files" nz-button [nzType]="'primary'" [nzLoading]="false" [disabled]="uploader.state === STARTED">
              <i class="anticon anticon-upload"></i><span>增加文件</span>
          </button>
          <button nz-button (click)="uploader.stop()" [disabled]="uploader.state === STOPPED">
              <i class="anticon anticon-close"></i><span>取消上传</span>
          </button>
          <button nz-button (click)="uploader.start()" [disabled]="uploader.total.queued == 0 || uploader.state === STARTED">
              <i class="anticon anticon-delete"></i><span>开始上传</span>
          </button>
      </nz-button-group>
  </nz-card>`,
  styles: []
})
export class UploadComponent implements OnInit, AfterViewInit {

    uploader: any;

    STARTED = plupload.STARTED;
    STOPPED = plupload.STOPPED;
    DONE = plupload.DONE;
    FAILED = plupload.FAILED;
    UPLOADING = plupload.UPLOADING;
    QUEUED = plupload.QUEUED;


    constructor(private userSrv: UserService, private log: NGXLogger, private msg: NzMessageService,
                private fileUploadSrv: FileUploadService, private appSrv: AppService) {
    }

    ngOnInit() {
        const me = this;
        this.uploader = new plupload.Uploader({
            runtimes : 'html5,flash,silverlight,html4',
            browse_button : 'select_files', // you can pass in id...
            url : server.apis.track.upload,
            chunk_size : '5mb',
            rename : false,
            flash_swf_url : 'Moxie.swf',
            silverlight_xap_url : 'Moxie.xap',
            headers: this.userSrv.getTokenHeader(),
            filters : {
                max_file_size : '1024mb',
                mime_types: [
                    {title : 'KMZ files', extensions : 'kmz'}
                ],
                prevent_duplicates: true
            },
            init: {
                PostInit: function() {
                },
                Error: function(up, err) {
                    me.msg.error(err.message);
                },
                UploadComplete: function(up, files) {
                },
                FileUploaded: function(up, file, info) {
                    // Called when file has finished uploading
                    if (server.successCode === JSON.parse(info.response).code) {
                        me.fileUploadSrv.notifyFileUploaded();
                    } else {
                        file.status = me.FAILED;
                        me.msg.error('文件上传失败');
                    }
                }
            }
        });
    }

    ngAfterViewInit(): void {
        this.uploader.setOption({
            browse_button : 'select_files',
            drop_element: 'track-table',
        });
        this.uploader.init();
    }
}

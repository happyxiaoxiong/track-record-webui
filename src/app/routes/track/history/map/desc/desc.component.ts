import {Component, Input, OnInit} from '@angular/core';
import {NzModalSubject} from 'ng-zorro-antd';
import {server} from '@core/service/app.service';

@Component({
    selector: 'app-track-desc',
    template: `        
        <nz-tabset [nzTabPosition]="'right'" [nzShowPagination]="desc.length > 5">
            <nz-tab *ngFor="let _desc of desc; index as i">
                <ng-template #nzTabHeading>
                    <span>{{getName(_desc)}}</span>
                    <!--<span>{{i + 1}}. </span><i class="fa fa-file-{{getType(_desc)}}-o" aria-hidden="true"></i>-->
                </ng-template>
                <div *ngIf="_desc.indexOf('photo') != -1" class="custom-image">
                    <img alt="" width="100%" [src]="getSrc(_desc)"/>
                </div>
                <video autoSizeHeight style="width: 100%" [ratio]="0.75" *ngIf="_desc.indexOf('video') != -1" [src]="getSrc(_desc)" controls="controls">
                    您的浏览器不支持 video 标签。
                </video>
                <audio autoSizeHeight style="width: 100%" [ratio]="0.75" *ngIf="_desc.indexOf('audio') != -1" [src]="getSrc(_desc)">
                    您的浏览器不支持 audio 标签。
                </audio>
            </nz-tab>
        </nz-tabset>
        
        <div class="customize-footer">
            <nz-row>
                <div nz-col [nzSpan]="16">
                    <i class="fa fa-map-marker"></i>
                    <span> 经纬度:({{gpsPoint.latitude}}, {{gpsPoint.longitude}})</span>
                </div>
                <div nz-col class="text-right" [nzSpan]="8">
                    <button nz-button (click)="ok()">
                        关 闭
                    </button>
                </div>
            </nz-row>
            
            
        </div>
    `,
    styles: [
        `
            :host ::ng-deep .ant-modal-body, :host ::ng-deep .ant-card-body {
                padding: 0 !important;
            }
                             

            :host ::ng-deep nz-card {
                margin-bottom: 0!important;
            }
            
            :host ::ng-deep .customize-footer {
                border-top: 1px solid #e9e9e9;
                padding: 10px 18px 0 10px;
                border-radius: 0 0 0px 0px;
                margin: 15px -16px -5px -16px;
            }
        `
    ]
})
export class DescComponent implements OnInit {
    @Input() desc = [];
    @Input() gpsPoint;
    @Input() id = 0;

    constructor(private subject: NzModalSubject) {
    }

    ngOnInit() {
        this.desc = this.desc.filter(desc => (desc.length - desc.lastIndexOf('/') - 1) > 0);
    }

    ok() {
        this.subject.destroy('onCancel');
    }

    getType(desc: string) {
        const s = desc.toLowerCase();
        if (s.indexOf('photo') !== -1) {
            return 'photo';
        }
        if (s.indexOf('audio') !== -1) {
            return 'audio';
        }
        return 'video';
    }

    getSrc(desc: string) {
        return `${server.host}${server.rootPath}track/${this.id}/${desc}`;
    }

    getName(desc: string) {
        return desc.substr(desc.lastIndexOf('/') + 1);
    }
}

import {Component, Input, OnInit} from '@angular/core';
import {NzModalSubject} from 'ng-zorro-antd';
import {server} from 'app/core/service/app.service';

@Component({
    selector: 'app-track-desc',
    template: `        
        <nz-tabset [nzTabPosition]="'bottom'">
            <!--<ng-template #nzTabBarExtraContent>-->
                <!--<a [href]="curSrc" title="下载" [ngStyle]="{ display : isImage ?  'none' : 'inline' }">-->
                    <!--<button nz-button [nzShape]="'circle'" >-->
                        <!--<i class="anticon anticon-download"></i>-->
                    <!--</button>-->
                <!--</a>-->
                <!--<button nz-button [nzType]="'default'" [nzSize]="'small'"  class="mr-lg">左旋</button>-->
                <!--<button nz-button [nzType]="'default'" [nzSize]="'small'">右旋</button>-->
            <!--</ng-template>-->
            <nz-tab *ngFor="let _desc of desc; index as i">
                <ng-template #nzTabHeading>
                    <span>{{getName(_desc)}}</span>
                </ng-template>
                <nz-card>
                    <ng-template #body>
                        <div *ngIf="_desc.indexOf('photo') != -1">
                            <img alt="图片无法显示" width="100%" [src]="getSrc(_desc)"/>
                        </div>
                        <video autoSizeHeight style="width: 100%; background-color: #000" [ratio]="0.6" *ngIf="_desc.indexOf('video') != -1" controls>
                            <source [src]="getSrc(_desc)" type="video/mp4">
                            您的浏览器不支持 video 标签.
                        </video>
                        <audio autoSizeHeight style="width: 100%; background-color: #000" [ratio]="0.6" *ngIf="_desc.indexOf('audio') != -1" [src]="getSrc(_desc)">
                            您的浏览器不支持 audio 标签.
                        </audio>
                    </ng-template>
                </nz-card>
            </nz-tab>
        </nz-tabset>
        
        <div class="customize-footer">
            <nz-row>
                <div nz-col [nzSpan]="16">
                    <i class="fa fa-map-marker"></i>
                    <span> 经纬度:({{gpsPoint.lat}}, {{gpsPoint.lat}})</span>
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
    // curSrc = '';
    // isImage = false;
    constructor(private subject: NzModalSubject) {
    }

    ngOnInit() {
        this.desc = this.desc.filter(desc => (desc.length - desc.lastIndexOf('/') - 1) > 0);
    }

    ok() {
        this.subject.destroy('onCancel');
    }

    getSrc(desc: string) {
        // this.isImage = desc.indexOf('photo') !== -1;
        return server.apis.track.media.replace(':id', this.id.toString()).replace(':name', desc);
    }

    getName(desc: string) {
        return desc.substr(desc.lastIndexOf('/') + 1);
    }
}

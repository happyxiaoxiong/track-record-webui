import {Component, Input, OnInit} from '@angular/core';
import {NzModalSubject} from 'ng-zorro-antd';
import {server} from 'app/core/service/app.service';
import {Utils} from '@shared/utils';
import {UserService} from '@core/service/user.service';

@Component({
    selector: 'app-track-desc',
    template: `        
        <nz-tabset *ngIf="desc.length > 0" [nzTabPosition]="'bottom'">
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
                    <span>{{_desc.name}}</span>
                </ng-template>
                <nz-card>
                    <ng-template #body>
                        <div [ngSwitch]="_desc.type">
                            <img *ngSwitchCase="1" alt="图片无法显示" width="100%" [src]="_desc.src"/>
                            <video *ngSwitchCase="2" autoSizeHeight class="media" [ratio]="0.6" [src]="_desc.src" controls>
                                <!--<source [src]="getSrc(_desc)" type="video/mp4">-->
                                您的浏览器不支持 video 标签.
                            </video>
                            <audio *ngSwitchCase="3" autoSizeHeight class="media" [ratio]="0.6" [src]="_desc.src">
                                您的浏览器不支持 audio 标签.
                            </audio>
                            <div *ngSwitchDefault>{{_desc}}</div>
                        </div>
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
            
            :host ::ng-deep .media {
                width: 100%;
                background-color: #000;
            }
        `
    ]
})
export class DescComponent implements OnInit {
    @Input() desc = [];
    @Input() gpsPoint;
    @Input() id = 0;
    constructor(private subject: NzModalSubject, private userSrv: UserService) {
    }

    ngOnInit() {
        this.desc = (this.desc || [])
            .filter(desc => (desc.length - desc.lastIndexOf('/') - 1) > 0)
            .map(desc => this.media(desc));
    }

    ok() {
        this.subject.destroy('onCancel');
    }

    media(desc: string) {
        let type = 0;
        if (desc.indexOf('photo') !== -1) {
            type = 1;
        } else if (desc.indexOf('video') !== -1) {
            type = 2;
        } else if (desc.indexOf('audio') !== -1) {
            type = 3;
        }
        if (type === 0) {
            if (desc.indexOf('/') === -1) {
                if (Utils.isImage(desc)) {
                    type = 1;
                    desc = 'photo/' + desc;
                } else if (Utils.isVideo(desc)) {
                    type = 2;
                    desc = 'video/' + desc;
                } else if (Utils.isAudio(desc)) {
                    type = 3;
                    desc = 'audio/' + desc;
                }
            }
        }
        return  {
            type: type,
            name: type === 0 ? desc : desc.substr(desc.lastIndexOf('/') + 1),
            src: Utils.urlParams(server.apis.track.media.replace(':id', this.id.toString()).replace(':name', desc),
                this.userSrv.getTokenQuery())
        };
    }


}

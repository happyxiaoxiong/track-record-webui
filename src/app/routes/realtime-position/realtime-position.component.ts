import {Component, OnInit, ViewChild} from '@angular/core';
import {FixWindowDirective} from '@core/directive/fix-window.directive';

declare const qq: any;

@Component({
    selector: 'app-realtime-position',
    template: `
        <full-content>
            <div nz-row [ngClass]="{'mt-sm': !fullScreen}" class="mb-sm">
                <div nz-col [nzSpan]="20">
                    <nz-select  style="width: 100%" [nzMode]="'multiple'"
                               [nzPlaceHolder]="'请选择在线巡护人员(默认显示全部)'"
                               [(ngModel)]="selectedUsers"
                               [nzNotFoundContent]="'无法找到'">
                        <nz-option
                            *ngFor="let option of onlineUsers"
                            [nzLabel]="option.label"
                            [nzValue]="option.value"
                            [nzDisabled]="option.disabled">
                        </nz-option>
                    </nz-select>
                </div>
                <div nz-col [nzSpan]="4" class="text-right">
                    <nz-switch full-toggle (click)="fullToggle()">
                        <span checked>取消全屏</span>
                        <span unchecked>全屏</span>
                    </nz-switch>
                </div>
            </div>
            <p></p>
            <div nz-row>
                <aqm-map #qqMap fixWindow [minWidth]="0" (ready)="onReady($event)"
                         ngClass="ant-card-bordered"></aqm-map>
            </div>
        </full-content>`,
    styles: []
})
export class RealtimePositionComponent implements OnInit {
    onlineUsers = [{ value: 'jack', label: '杰克' }];
    selectedUsers = [];
    private map: any;
    private fullScreen = false;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor() { }

    ngOnInit() {
        this.selectedUsers = this.onlineUsers;
    }

    onReady(mapNative: any) {
        mapNative.setOptions({
            zoom: 12,
            center: new qq.maps.LatLng(39.916527, 116.397128)
        });
        this.map = mapNative;
    }

    fullToggle() {
        this.fullScreen = !this.fullScreen;
        this.fixWindowDirective.onResize();
    }
}

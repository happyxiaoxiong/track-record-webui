import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ListComponent} from './list/list.component';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {MapService} from '@core/service/map.service';
import {QqMapComponent} from './qq-map/qq-map.component';
import {GoogleMapComponent} from './google-map/google-map.component';

@Component({
    selector: 'app-history',
    template: `
        <full-content>
            <nz-row [ngClass]="{'mt-sm': !fullScreen}" >
                <nz-tabset [nzType]="'line'">
                    <ng-template #nzTabBarExtraContent>
                        <nz-badge *ngIf="mapComp.clickPoint" [nzStatus]="'processing'" [nzText]="choosePointText()">
                        </nz-badge>
                        <button *ngIf="mapComp.clickPoint" nz-button [nzType]="'dashed'" (click)="positionCenterClick()" [disabled]="!listComp.positionExpand"
                                [nzSize]="'small'">作为中心点
                        </button>
                        <nz-switch [(ngModel)]="mapComp.autoAdjust" class="mx-sm">
                            <span checked>取消视野自动调整</span>
                            <span unchecked>视野自动调整</span>
                        </nz-switch>
                        <nz-switch full-toggle (click)="fullToggle()">
                            <span checked>取消全屏</span>
                            <span unchecked>全屏</span>
                        </nz-switch>
                    </ng-template>
                    <nz-tab>
                        <ng-template #nzTabHeading>
                            <i class="fa fa-list-alt"></i>
                            列表
                        </ng-template>
                        <app-track-history-list fixWindow [minWidth]="0"></app-track-history-list>
                    </nz-tab>
                    <nz-tab>
                        <ng-template #nzTabHeading>
                            <i class="fa fa-map-marker"></i>
                            地图
                            <nz-tag [nzColor]="'green'">{{mapComp.count}}
                                <nz-tooltip [nzTitle]="'清除'">
                                    <i nz-tooltip class="fa fa-close" (click)="clear($event)"></i>
                                </nz-tooltip>
                            </nz-tag>
                        </ng-template>
                        <app-track-history-google-map *ngIf="mapSrv.isGoogle()" #historyMap></app-track-history-google-map>
                        <app-track-history-qq-map *ngIf="mapSrv.isQq()" #historyMap></app-track-history-qq-map>
                    </nz-tab>
                </nz-tabset>
            </nz-row>
        </full-content>`,
    styles: [
            `
            :host ::ng-deep app-track-history-list {
                display: block;
                overflow: auto;
            }
        `
    ]
})
export class HistoryComponent implements AfterViewInit {

    fullScreen = false;
    mapComp: any = {
    };
    @ViewChild('historyMap') historyMap;
    @ViewChild(ListComponent) listComp;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private http: HttpClient, private mapSrv: MapService) {
    }

    ngAfterViewInit() {
        // FIXED: Expression has changed after it was checked. Previous value: 'undefined'. Current value: '[object Object]'.
        setTimeout(() => {
            this.mapComp = this.historyMap;
        }, 500);
    }

    fullToggle() {
        this.fullScreen = !this.fullScreen;
        this.fixWindowDirective.onResize();
    }

    positionCenterClick() {
        this.listComp.params.lat = this.mapComp.clickPoint.lat;
        this.listComp.params.lng = this.mapComp.clickPoint.lng;
    }

    choosePointText() {
        return `当前选中位置(经度:${this.mapComp.clickPoint.lng},纬度:${this.mapComp.clickPoint.lat})`;
    }

    clear($event) {
        this.listComp.unSelectAll();
        this.mapComp.clear();
        $event.stopPropagation();
    }
}

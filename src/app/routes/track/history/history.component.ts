import {AfterViewInit, Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MapComponent} from './map/map.component';
import {ListComponent} from './list/list.component';
import {FixWindowDirective} from '@core/directive/fix-window.directive';

@Component({
    selector: 'app-history',
    template: `
        <full-content>
        <nz-row>
                <nz-tabset [nzType]="'line'">
                    <ng-template #nzTabBarExtraContent>
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
                        <app-track-history-list #historyList fixWindow [minWidth]="0"></app-track-history-list>
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
                        <app-track-history-map #historyMap></app-track-history-map>
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
export class HistoryComponent implements OnInit, AfterViewInit {

    @ViewChild('historyMap') mapComp: MapComponent;
    @ViewChild('historyList') listComp: ListComponent;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {

    }

    _onReuseInit() {
        // this.listComp.search();
    }

    ngAfterViewInit(): void {
    }

    fullToggle() {
        this.fixWindowDirective.onResize();
    }

    clear($event) {
        this.listComp.unSelectAll();
        this.mapComp.clear();
        $event.stopPropagation();
    }
}

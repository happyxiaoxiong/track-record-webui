import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import * as moment from 'moment';
import {Utils} from '@shared/utils';
import {NzDatePickerComponent} from 'ng-zorro-antd';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-stat',
    template: `
        <nz-tabset [nzType]="'line'" class="pt-sm">
            <ng-template #nzTabBarExtraContent>
                <nz-switch class="mr-sm" [(ngModel)]="showEmpty" (click)="setUsersMonthOption(monthStats)">
                    <span checked>过滤空数据用户</span>
                    <span unchecked>显示所有用户</span>
                </nz-switch>
                <span>月份选择: </span>
                <nz-datepicker #datePicker [nzDisabled]="monthLoading" [nzSize]="'default'" [(ngModel)]="selectedMonth"
                               [nzMode]="'month'"
                               [nzDisabledDate]="_disabledMonth" [nzFormat]="'YYYY-MM'"></nz-datepicker>
                <nz-button-group class="ml-sm">
                    <button nz-button [nzLoading]="monthLoading" (click)="addMonth(-12)">上一年</button>
                    <button nz-button [nzLoading]="monthLoading" (click)="addMonth(-1)">上月</button>
                    <button nz-button [nzLoading]="monthLoading" (click)="addMonth(1)">下月</button>
                    <button nz-button [nzLoading]="monthLoading" (click)="addMonth(12)">下一年</button>
                </nz-button-group>
            </ng-template>
            <nz-tab>
                <ng-template #nzTabHeading>
                    <i class="fa fa-bar-chart"></i>
                    图表
                </ng-template>
                <nz-row [nzGutter]="16" style="margin: 0 -8px">
                    <div nz-col [nzLg]="12" [nzXs]="24">
                        <nz-card [nzTitle]="monthChartTitle">
                            <ng-template #monthChartTitle> {{selectedMonthFormat()}}月数据</ng-template>
                            <div *ngIf="usersMonthOption" echarts [ngStyle]="initOpts" [options]="usersMonthOption"
                                 [initOpts]="initOpts"
                                 [loading]="monthLoading"
                                 (chartClick)="monthChartClick($event)"></div>
                            <div *ngIf="!usersMonthOption" class="text-center" [ngStyle]="initOpts"> 当月无巡护数据</div>
                        </nz-card>
                    </div>
                    <div nz-col [nzLg]="12" [nzXs]="24">
                        <nz-card [nzTitle]="dayChartTitle">
                            <ng-template #dayChartTitle> 用户名
                                <small>{{selectedUser.name}}</small>
                            </ng-template>
                            <div *ngIf="userDayOption" echarts [options]="userDayOption" [initOpts]="initOpts"
                                 [loading]="dayLoading"></div>
                            <div *ngIf="!userDayOption" class="text-center" [ngStyle]="initOpts"> 未选择用户</div>
                        </nz-card>
                        <!--<echarts [initOpts]="initOpts" [options]="userDayOption"></echarts>-->
                    </div>
                </nz-row>
            </nz-tab>
            <nz-tab>
                <ng-template #nzTabHeading>
                    <i class="fa fa-list-alt"></i>
                    列表
                </ng-template>
                <div nz-col [nzSpan]="24">
                    <nz-card [nzTitle]="table">
                        <ng-template #table>
                            {{selectedMonthFormat()}}月数据
                        </ng-template>
                        <nz-table #nzTable [nzDataSource]="displayMonthStats" [nzSize]="'small'"
                                  [nzCustomNoResult]="false"
                                  [nzLoading]="monthLoading" [nzIsPagination]="true" [nzShowSizeChanger]="true"
                                  [nzShowTotal]="true" [nzIsPageIndexReset]="false">
                            <thead nz-thead>
                            <tr>
                                <th nz-th nzExpand></th>
                                <th nz-th>
                                    <span>用户名<nz-table-sort [nzValue]="sortMap.userName"
                                                            (nzValueChange)="sortChange('userName', $event)"></nz-table-sort></span>
                                    <nz-dropdown [nzTrigger]="'click'" [nzClickHide]="false">
                                        <i class="anticon anticon-filter" nz-dropdown></i>
                                        <div nz-dropdown-custom class="custom-filter-dropdown">
                                            <nz-input [(ngModel)]="searchValue" [nzPlaceHolder]="'用户名搜索'"
                                                      [nzType]="'search'" (nzOnSearch)="search()"></nz-input>
                                        </div>
                                    </nz-dropdown>
                                </th>
                                <th nz-th>
                                    <span>巡护长度<nz-table-sort [nzValue]="sortMap.totalLength"
                                                             (nzValueChange)="sortChange('totalLength', $event)"></nz-table-sort></span>
                                </th>
                                <th nz-th>
                                    <span>巡护时间<nz-table-sort [nzValue]="sortMap.totalTime"
                                                             (nzValueChange)="sortChange('totalTime', $event)"></nz-table-sort></span>
                                </th>
                                <th nz-th>
                                    <span>巡护天数<nz-table-sort [nzValue]="sortMap.totalDay"
                                                             (nzValueChange)="sortChange('totalDay', $event)"></nz-table-sort></span>
                                </th>
                                <th nz-th>
                                    <span>巡护次数<nz-table-sort [nzValue]="sortMap.totalCount"
                                                             (nzValueChange)="sortChange('totalCount', $event)"></nz-table-sort></span>
                                </th>
                            </tr>
                            </thead>
                            <tbody nz-tbody>
                            <ng-template ngFor let-stat [ngForOf]="nzTable.data">
                                <tr nz-tbody-tr>
                                    <td nz-td nzExpand>
                                        <nz-spin *ngIf="stat.exist" [nzSpinning]="stat.loading">
                                            <nz-row-expand-icon (nzExpandChange)="collapse($event, stat)"
                                                                [(nzExpand)]="stat.expand"></nz-row-expand-icon>
                                        </nz-spin>

                                    </td>
                                    <td nz-td><strong>{{ stat.userName }}</strong></td>
                                    <td nz-td>{{ stat.totalLength | meterFormat }}</td>
                                    <td nz-td>{{ stat.totalTime | timeFormat }}</td>
                                    <td nz-td>{{ stat.totalDay }}</td>
                                    <td nz-td>{{ stat.totalCount }}</td>
                                </tr>
                                <ng-template *ngIf="stat.exist && stat.expand" ngFor let-stat [ngForOf]="stat.days">
                                    <tr nz-tbody-tr>
                                        <td nz-td>
                                            <nz-row-indent [nzIndentSize]="1"></nz-row-indent>
                                        </td>
                                        <td nz-td class="text-center">{{stat.date}}</td>
                                        <td nz-td>{{ stat.totalLength | meterFormat }}</td>
                                        <td nz-td>{{ stat.totalTime | timeFormat }}</td>
                                        <td nz-td>1</td>
                                        <td nz-td>{{ stat.totalCount }}</td>
                                    </tr>
                                </ng-template>
                            </ng-template>
                            </tbody>
                        </nz-table>
                    </nz-card>
                </div>
            </nz-tab>
        </nz-tabset>
    `,
    styles: [``]
})
export class StatComponent implements AfterViewInit {

    private defaultOption;

    private users: any;
    selectedUser: any = {};
    selectedMonth = moment().startOf('month').subtract(1, 'months').toDate();
    initOpts = {
        height: '400px'
    };
    usersMonthOption = {};
    userDayOption: any;
    monthLoading = false;
    dayLoading = false;
    monthStats: Array<any> = [];
    displayMonthStats: Array<any> = [];

    private readonly baseLegendData = [{ch: '巡护长度(km)', en: 'totalLength', div: 1000}, {ch: '巡护时间(h)', en: 'totalTime', div: 3600}, {ch: '巡护次数', en: 'totalCount'}, {ch: '巡护天数', en: 'totalDay'}];
    private readonly emptyStat = {
        totalLength: 0,
        totalTime: 0,
        totalDay: 0,
        totalCount: 0
    };

    showEmpty = true;
    @ViewChild('datePicker') datePicker: NzDatePickerComponent;

    constructor(private http: HttpClient) {
    }

    ngAfterViewInit(): void {
        this.http.get(server.apis.user.all).subscribe((res: HttpRes) => {
            if (server.successCode === res.code) {
                this.users = res.data;
                this.sort(this.users, 'id');
                this.defaultOption = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow',
                            label: {
                                show: true
                            }
                        }
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    grid: {
                        top: '12%',
                        left: '1%',
                        right: '10%',
                        containLabel: true
                    },
                    yAxis: {},
                };
                const onChange = this.datePicker.onChange;
                this.datePicker.registerOnChange((date) => {
                    onChange(date);
                    if (date != null) {
                        this.monthCharts();
                    }
                });
                this.monthCharts();
            }
        });
    }

    monthCharts() {
        this.monthLoading = true;
        //
        this.userDayOption = null;
        this.selectedUser = {};
        this.http.get(server.apis.track.statMonth, {
            params: {
                month: moment(this.selectedMonth).format('YYYY-MM-DD')
            }
        }).finally(() => {
            this.monthLoading = false;
        }).subscribe((res: HttpRes) => {
                if (server.successCode === res.code) {
                    const stats = [];
                    if (res.data.length > 0) {// 无数据
                        this.sort(res.data, 'userId');
                        for (let i = 0, j = 0; i < this.users.length; i++) {
                            if (j >= res.data.length || res.data[j].userId !== this.users[i].id) {
                                stats.push({
                                    ...this.emptyStat,
                                    userId: this.users[i].id,
                                    userName: this.users[i].name,
                                    exist: false
                                });
                            } else {
                                stats.push({...res.data[j++], exist: true});
                            }
                        }
                    }
                    this.monthStats = stats;
                    this.setUsersMonthOption(stats);
                }
            }
        );
    }

    setUsersMonthOption(stats) {
        const monthStats = stats.filter(stat => this.showEmpty || (!this.showEmpty && stat.exist));
        this.usersMonthOption = monthStats.length > 0 ? {
            ...this.defaultOption,
            legend: this.baseLegend(this.baseLegendData.map(legend => legend.ch)),
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: this.showEmpty ? this.users.map(user => user.name) : monthStats.map(stat => stat.userName)
            }],
            series: this.baseSeries(monthStats, 'userName'),
            dataZoom: this.dataZoom(this.showEmpty ? this.users : monthStats)
        } : null;
        this.search();
    }

    monthChartClick(evt) {
        if (evt.name === this.selectedUser.name) {
            return;
        }
        this.selectedUser = {name: evt.name, id: evt.data[2]};
        const tmpStat = this.monthStats.find(stat => stat.userId === this.selectedUser.id);
        if (!tmpStat.days) {
            this.dayLoading = tmpStat.loading = true;
            this.http.get(server.apis.track.statDay, {
                params: this.getStatDayParams(this.selectedUser.id)
            }).finally(() => this.dayLoading = tmpStat.loading = false)
                .subscribe((res: HttpRes) => {
                        if (server.successCode === res.code) {
                            tmpStat.days = res.data;
                            this.setUserDayOption(tmpStat.days);
                        }
                    }
                );
        } else {
            this.setUserDayOption(tmpStat.days);
        }
    }

    setUserDayOption(stats) {
        this.userDayOption = {
            ...this.defaultOption,
            legend: this.baseLegend(this.baseLegendData.map(legend => legend.ch).slice(0, 3)),
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: stats.map(stat => stat.date)
            }],
            series: this.baseSeries(stats, 'date').slice(0, 3),
            dataZoom: this.dataZoom(stats),
        };
    }

    getStatDayParams(userId) {
        return {
            userId: userId,
            beginTime: moment(this.selectedMonth).format('YYYY-MM-DD'),
            endTime: moment(this.selectedMonth).add(1, 'months').format('YYYY-MM-DD'),
        };
    }

    collapse(evt, stat) {
        if (!stat.days) {
            stat.loading = true;
            this.http.get(server.apis.track.statDay, {params: this.getStatDayParams(stat.userId)})
                .finally(() => stat.loading = false)
                .subscribe((res: HttpRes) => {
                        if (server.successCode === res.code) {
                            stat.days = res.data;
                        }
                    }
                );
        }
    }

    _disabledMonth(current: Date): boolean {
        return current && moment(current).valueOf() >= moment().startOf('month').valueOf();
    }

    sort(arr: Array<any>, key: string, asc: boolean = true) {
        arr.sort((a, b) => {
            return (a[key] > b[key] ? 1 : -1) * (asc ? 1 : -1);
        });
    }

    baseLegend(data) {
        return {
            data: data,
            itemGap: 5,
            itemWidth: 14,
            itemHeight: 14,
            left: '10%'
        };
    }

    baseSeries(stats, xAxisKey: string) {
        return this.baseLegendData.map(legend => ({
                name: legend.ch,
                type: 'bar',
                data: this.statMap(stats, legend.en, xAxisKey, legend.div || 1)
        }));
    }

    dataZoom(data: Array<any>) {
        const start = data.length <= 5 ? 0 : 100 - (5 / data.length) * 100;
        return [{
            show: true,
            start: start,
            end: 100,
            height: 20,
            left: '5%'
        }, {
            type: 'inside',
            start: start,
            end: 100
        }, {
            show: true,
            yAxisIndex: 0,
            filterMode: 'empty',
            width: 20,
            height: '80%',
            showDataShadow: true,
            left: '93%'
        }
        ];
    }

    statMap(stats: Array<any>, key: string, xAxisKey: string, div = 1) {
        return stats.map(stat => [stat[xAxisKey], parseFloat((stat[key] / div).toFixed(2)), stat.userId]);
    }

    selectedMonthFormat() {
        return moment(this.selectedMonth).format('YYYY-MM');
    }

    addMonth(num) {
        this.selectedMonth = moment(this.selectedMonth).add(num, 'months').toDate();
        this.monthCharts();
    }

    // region:search and sort
    searchValue = '';
    sortMap = {
        userName: null,
        totalLength: null,
        totalTime: null,
        totalCount: null,
        totalDay: null
    };
    sortName = null;
    sortValue = 'descend';

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
        this.displayMonthStats = this.monthStats.filter((stat) => {
            return (this.showEmpty || (!this.showEmpty && stat.exist)) && (this.searchValue.length > 0 ? stat.userName.indexOf(this.searchValue) !== -1 : true);
        });
        if (this.sortName) {
            this.displayMonthStats = [...this.displayMonthStats.sort((a, b) => {
                if (a[this.sortName] > b[this.sortName]) {
                    return (this.sortValue === 'ascend') ? 1 : -1;
                } else if (a[this.sortName] < b[this.sortName]) {
                    return (this.sortValue === 'ascend') ? -1 : 1;
                } else {
                    return 0;
                }
            })];
        }
    }

    // endregion
}

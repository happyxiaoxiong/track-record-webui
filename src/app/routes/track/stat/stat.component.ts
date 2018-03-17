import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';
import * as moment from 'moment';
import {Utils} from '@shared/utils';
import {NzDatePickerComponent} from 'ng-zorro-antd';

@Component({
    selector: 'app-stat',
    template: `
        <div nz-row nzGutter="16" class="pt-lg">
            <div nz-col [nzLg]="12" [nzXs]="24">
                <nz-card [nzTitle]="monthChartTitle">
                    <ng-template #monthChartTitle> 月份
                        <nz-datepicker #datePicker [nzSize]="'small'" [(ngModel)]="selectedMonth" [nzMode]="'month'"
                                       [nzDisabledDate]="_disabledMonth" [nzFormat]="'YYYY-MM'"></nz-datepicker>
                    </ng-template>
                    <div echarts [ngStyle]="initOpts" [options]="usersMonthOption" [initOpts]="initOpts" [loading]="monthLoading"
                         (chartClick)="monthChartClick($event)"></div>
                </nz-card>
            </div>
            <div nz-col [nzLg]="12" [nzXs]="24">
                <nz-card [nzTitle]="dayChartTitle">
                    <ng-template #dayChartTitle> 用户名
                        <small>{{selectedUser}}</small>
                    </ng-template>
                    <div *ngIf="userDayOption" echarts [options]="userDayOption" [initOpts]="initOpts"
                         [loading]="dayLoading"></div>
                    <div *ngIf="!userDayOption" class="text-center" [ngStyle]="initOpts"> 未选择用户</div>
                </nz-card>                  <!--<echarts [initOpts]="initOpts" [options]="userDayOption"></echarts>-->
            </div>
        </div>
        <div nz-row>
            <div nz-col [nzSpan]="24">
                <nz-card [nzTitle]="table">
                    <ng-template #table>
                        {{selectedMonthFormat()}}月数据
                    </ng-template>
                    <nz-table #nzTable [nzDataSource]="displayMonthStats" [nzSize]="'small'" [nzCustomNoResult]="false"
                              [nzLoading]="monthLoading" [nzIsPagination]="true" [nzShowSizeChanger]="true"
                              [nzShowTotal]="true" [nzIsPageIndexReset]="false">
                        <thead nz-thead>
                        <tr>
                            <th nz-th nzExpand></th>
                            <th nz-th>
                                <span>用户名<nz-table-sort [nzValue]="sortMap.userName" (nzValueChange)="sortChange('userName', $event)"></nz-table-sort></span>
                                <nz-dropdown [nzTrigger]="'click'" [nzClickHide]="false">
                                    <i class="anticon anticon-filter" nz-dropdown></i>
                                    <div nz-dropdown-custom class="custom-filter-dropdown">
                                        <nz-input [(ngModel)]="searchValue" [nzPlaceHolder]="'用户名搜索'" [nzType]="'search'" (nzOnSearch)="search()"></nz-input>
                                    </div>
                                </nz-dropdown>
                            </th>
                            <th nz-th>
                                <span>巡护长度<nz-table-sort [nzValue]="sortMap.totalLength" (nzValueChange)="sortChange('totalLength', $event)"></nz-table-sort></span>
                            </th>
                            <th nz-th>
                                <span>巡护时间<nz-table-sort [nzValue]="sortMap.totalTime" (nzValueChange)="sortChange('totalTime', $event)"></nz-table-sort></span>
                            </th>
                            <th nz-th>
                                <span>巡护天数<nz-table-sort [nzValue]="sortMap.totalDay" (nzValueChange)="sortChange('totalDay', $event)"></nz-table-sort></span>
                            </th>
                            <th nz-th>
                                <span>巡护次数<nz-table-sort [nzValue]="sortMap.totalCount" (nzValueChange)="sortChange('totalCount', $event)"></nz-table-sort></span>
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
        </div>      `,
    styles: [``]
})
export class StatComponent implements AfterViewInit {

    private defaultOption;

    private users: any;
    selectedUser;
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

    private baseLegendData = ['巡护长度', '巡护时间', '巡护次数'];

    private readonly emptyStat = {
        totalLength: 0,
        totalTime: 0,
        totalDay: 0,
        totalCount: 0
    };
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
                        },
                        formatter: function (params) {
                            let text = params[0].name + '<br/>';
                            params = params.filter(param => param.data[1] > 0);
                            if (params.length > 0) {
                                for (let i = 0; i < params.length; i++) {
                                    if (i !== 0) {
                                        text += '<br/>';
                                    }
                                    text += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:'
                                        + params[i].color + ';"></span>' + params[i].seriesName + ': ';
                                    const val = params[i].data[1];
                                    if (params[i].seriesName === '巡护长度') {
                                        text += Utils.formatMeterCn(val);
                                    } else if (params[i].seriesName === '巡护时间') {
                                        text += Utils.formatTimeCn(val);
                                    } else if (params[i].seriesName === '巡护天数') {
                                        text += val + '天';
                                    } else if (params[i].seriesName === '巡护次数') {
                                        text += val + '次';
                                    } else {
                                        text += val;
                                    }
                                }
                            } else {
                                text += '当月无数据';
                            }
                            return text;
                        },
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
                this.datePicker.registerOnChange((date) => {
                    if (date != null) {
                        this.selectedMonth = date;
                        this.monthCharts();
                    }
                });
                this.monthCharts();
            }
        });
    }

    monthCharts() {
        this.monthLoading = true;
        this.http.get(server.apis.track.statMonth, {
            params: {
                month: moment(this.selectedMonth).format('YYYY-MM-DD')
            }
        }).finally(() => {
            this.monthLoading = false;
        }).subscribe((res: HttpRes) => {
                if (server.successCode === res.code) {
                    const stats = [];
                    this.sort(res.data, 'userId');
                    for (let i = 0, j = 0; i < this.users.length; i++) {
                        if (j >= res.data.length || res.data[j].userId !== this.users[i].id) {
                            stats.push(Object.assign({}, this.emptyStat, {
                                userId: this.users[i].id,
                                userName: this.users[i].name,
                                exist: false
                            }));
                        } else {
                            stats.push(Object.assign({}, res.data[j++], {exist: true}));
                        }
                    }
                    this.usersMonthOption = Object.assign({}, this.defaultOption, {
                        legend: this.baseLegend(this.baseLegendData.concat('巡护天数')),
                        xAxis: [{
                            type: 'category',
                            boundaryGap: true,
                            data: this.users.map(user => user.name)
                        }],
                        series: this.baseSeries(stats).concat({
                            name: '巡护天数',
                            type: 'bar',
                            data: this.statMap(stats, 'totalDay')
                        }),
                        dataZoom: this.dataZoom(this.users),
                    });
                    this.monthStats = stats;
                    this.search();
                }
            }
        );
    }

    monthChartClick(evt) {
        this.dayLoading = true;
        this.selectedUser = evt.name;
        this.http.get(server.apis.track.statDay, {
            params: this.getStatDayParams(evt.data[2])
        }).finally(() => this.dayLoading = false)
            .subscribe((res: HttpRes) => {
                if (server.successCode === res.code) {
                    const stats = res.data;
                    this.userDayOption = Object.assign({}, this.defaultOption, {
                        legend: this.baseLegend(this.baseLegendData),
                        xAxis: [{
                            type: 'time',
                            boundaryGap: true,
                            data: stats.map(stat => stat.date)
                        }],
                        series: this.baseSeries(stats),
                        dataZoom: this.dataZoom(stats),
                    });
                }
            }
        );
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
            this.http.get(server.apis.track.statDay, { params: this.getStatDayParams(stat.userId)})
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

    baseSeries(stats) {
        return [{
            name: '巡护长度',
            type: 'bar',
            data: this.statMap(stats, 'totalLength')
        }, {
            name: '巡护时间',
            type: 'bar',
            data: this.statMap(stats, 'totalTime')
        }, {
            name: '巡护次数',
            type: 'bar',
            data: this.statMap(stats, 'totalCount'),
        }
        ];
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

    statMap(stats: Array<any>, key: string) {
        return stats.map(stat => [stat.userName, stat[key], stat.userId]);
    }

    selectedMonthFormat() {
        return moment(this.selectedMonth).format('YYYY-MM');
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
        this.displayMonthStats = [...this.monthStats].filter((stat) => {
            return this.searchValue.length > 0 ? stat.userName.indexOf(this.searchValue) !== -1 : true;
        });
        if (this.sortValue) {
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

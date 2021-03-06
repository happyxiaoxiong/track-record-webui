import {AfterViewInit, Component, NgZone, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NzMessageService, NzSelectComponent} from 'ng-zorro-antd';
import {ColorService} from '@core/service/color.service';
import {server} from '@core/service/app.service';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {HttpRes} from '@core/model/http-res';
import * as moment from 'moment';
import {GoogleMapsService} from 'google-maps-angular2';
import {MapService} from '@core/service/map.service';
import 'rxjs/add/operator/finally';
import {Utils} from '@shared/utils';
import 'rxjs/add/operator/takeWhile';

declare const google: any;

@Component({
  selector: 'app-realtime-position-google-map',
  template: `
      <full-content #target>
          <div nz-row [ngClass]="{'mt-lg': !fullScreen}" class="mb-sm">
              <div nz-col [nzSm]="17" [nzXs]="15">
                  <nz-select #selectUser style="width: 100%" [nzMode]="'multiple'"
                             [nzPlaceHolder]="'请选择在线巡护人员(默认显示全部)'"
                             [nzNotFoundContent]="'无法找到'">
                      <nz-option
                          *ngFor="let option of onlineUsers"
                          [nzLabel]="option.userName"
                          [nzValue]="option"
                          [nzDisabled]="option.disabled">
                      </nz-option>
                  </nz-select>
              </div>
              <div nz-col [nzSm]="7" [nzXs]="9" class="text-right">
                  <nz-switch [(ngModel)]="autoAdjust" class="mr-sm">
                      <span checked>取消视野自动调整</span>
                      <span unchecked>视野自动调整</span>
                  </nz-switch>
                  <nz-switch full-toggle (click)="fullToggle()" class="mr-sm">
                      <span checked>取消全屏</span>
                      <span unchecked>全屏</span>
                  </nz-switch>
                  <button nz-tooltip nz-button [nzSize]="'small'" [nzShape]="'circle'" #closeBtn
                          (click)="closeToggle()">
                      <i class="anticon anticon-double-{{ rightClose ? 'left' : 'right' }}"></i>
                  </button>
              </div>
          </div>
          <div nz-row [ngClass]="{'mt-sm': !fullScreen}">
              <div nz-col [nzMd]="rightClose ? 24 : 20" [nzSm]="rightClose ? 24 : 18" [nzXs]="rightClose ? 24 : 16">
                  <div id="realTimeGoogleMap" fixWindow [minWidth]="0" ngClass="ant-card-bordered"></div>
              </div>
              <div nz-col [nzMd]="rightClose ? 0 : 4" [nzSm]="rightClose ? 0 : 6" [nzXs]="rightClose ? 0 : 8">
                  <div class="ml-sm">
                      <nz-card [nzBordered]="false" nzNoPadding>
                          <div nz-row class="py-sm px-sm bg-grey-lighter-h">
                              <strong>用户名:</strong>
                              <p>{{curUser.userName}}&nbsp;</p>
                          </div>
                          <div class="py-sm px-sm bg-grey-lighter-h">
                              <strong>经度:</strong>
                              <p>{{curUser.lng}}&nbsp;</p>
                          </div>
                          <div class="py-sm px-sm bg-grey-lighter-h">
                              <strong>纬度:</strong>
                              <p>{{curUser.lat}}&nbsp;</p>
                          </div>
                          <div class="py-sm px-sm bg-grey-lighter-h">
                              <strong>海拔:</strong>
                              <p>{{curUser.altitude}}&nbsp;</p>
                          </div>
                          <div class="py-sm px-sm bg-grey-lighter-h">
                              <strong>更新时间:</strong>
                              <p>{{curUser.time?.substr(11)}}&nbsp;</p>
                          </div>
                          <!--<div class="py-sm px-sm">-->
                          <!--<nz-switch [(ngModel)]="curUser.showTrack" [nzDisabled]="curUser.disabled" (click)="trackToggle()">-->
                          <!--<span checked>隐藏当天轨迹</span>-->
                          <!--<span unchecked>显示当天轨迹</span>-->
                          <!--</nz-switch>-->
                          <!--</div>-->
                      </nz-card>
                      <nz-select style="width: 100%" [(ngModel)]="selectedTime" [nzPlaceHolder]="''">
                          <nz-option
                              *ngFor="let option of lastTimes"
                              [nzLabel]="option.label"
                              [nzValue]="option"
                              [nzDisabled]="option.disabled">
                          </nz-option>
                      </nz-select>
                      <nz-alert nzShowIcon [nzType]="'info'" style="margin-top: 16px;">
                            <span alert-body>
                                在线人数: {{onlineUsers.length}}
                            </span>
                      </nz-alert>
                  </div>
              </div>
          </div>
      </full-content>
  `,
})

export class GoogleMapComponent implements AfterViewInit, OnDestroy {
    lastTimes = [
        { value: 5, label: '显示最近5分钟在线', disabled: false },
        { value: 10, label: '显示最近10分钟在线', disabled: false },
        { value: 30, label: '显示最近30分钟在线', disabled: false },
        { value: 60, label: '显示最近1个小时在线', disabled: false },
        { value: 24 * 60, label: '显示当天在线', disabled: false }];
    selectedTime = this.lastTimes[this.lastTimes.length - 1];

    onlineUsers: Array<any> = [];
    selectedUsers: Array<any> = [];
    curUser: any = {};

    private map: any;
    fullScreen = false;
    private queryTimer;
    private queryInterval = 5000;
    private timerAlive = true;
    autoAdjust = true;
    rightClose = false;

    @ViewChild('selectUser') selectUserComp: NzSelectComponent;
    @ViewChild(FixWindowDirective) fixWindowDirective;

    constructor(private http: HttpClient, private colorSrv: ColorService, private gapi: GoogleMapsService, private mapSrv: MapService,
                private msgSrv: NzMessageService, private zone: NgZone) {
    }

    ngAfterViewInit(): void {
        const me = this;
        try {
            me.loadMap();
        } catch (ex) {
            this.gapi.init.then(() => {
                me.loadMap();
            });
        }
    }

    loadMap() {
        const me = this;
        me.map = new google.maps.Map(document.getElementById('realTimeGoogleMap'), me.mapSrv.getDefaultOptions());
        // 延迟定义
        UserOverlay.prototype = new google.maps.OverlayView();
        // 定义construct,实现这个接口来初始化自定义的Dom元素
        UserOverlay.prototype.onAdd = function () {
            const div = this.div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.zIndex = '0';
            div.style.display = 'block';
            div.style.fontSize = '12px';
            div.style.fontWeight = 'normal';
            div.style.lineHeight = '1.4';
            div.style.opacity = '0.9';
            div.style.filter = 'alpha(opacity=90)';
            div.style.whiteSpace = 'nowrap';

            const arrow = document.createElement('div');
            arrow.style.position = 'absolute';
            arrow.style.width = '0';
            arrow.style.height = '0';
            arrow.style.borderColor = 'transparent';
            arrow.style.borderStyle = 'solid';
            arrow.style.top = '0';
            arrow.style.left = '5px';
            arrow.style.marginTop = '-4px';
            arrow.style.borderWidth = '0 5px 5px';
            arrow.style.borderBottomColor = this.options.bgColor;
            this.div.appendChild(arrow);

            const inner = document.createElement('div');
            inner.style.padding = '3px 5px';
            inner.style.color = this.options.textColor;
            inner.style.textAlign = 'center';
            inner.style.textDecoration = 'none';
            inner.style.backgroundColor = this.options.bgColor;
            inner.style.borderRadius = '4px';
            inner.innerHTML = this.userName;
            this.div.appendChild(inner);

            for (const evt in this.evts) {
                if (this.evts.hasOwnProperty(evt)) {
                    this.div[evt] = this.evts[evt];
                }
            }

            const panes = this.getPanes();
            // 设置panes的层级，overlayMouseTarget可接收点击事件
            panes.overlayMouseTarget.appendChild(this.div);
        };
        // 实现draw接口来绘制和更新自定义的dom元素
        UserOverlay.prototype.draw = function () {
            const overlayProjection = this.getProjection();
            // 返回覆盖物容器的相对像素坐标
            const pixel = overlayProjection.fromLatLngToDivPixel(this.position);
            const divStyle = this.div.style;
            divStyle.left = (pixel.x - 10) + 'px';
            divStyle.top = pixel.y + 'px';
        };
        // 实现destroy接口来删除自定义的Dom元素，此方法会在setMap(null)后被调用
        UserOverlay.prototype.onRemove = function () {
            for (const evt in this.evts) {
                if (this.evts.hasOwnProperty(evt)) {
                    this.div[evt] = null;
                }
            }
            this.evts = {};
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        };

        UserOverlay.prototype.addListener = function (evt: string, fn: Function) {
            if (!this.evts.hasOwnProperty(evt)) {
                this.evts[evt] = fn;
            }
        };

        me.mapSrv.locate(me.map);
        me.startSync();
    }

    fullToggle() {
        this.fullScreen = !this.fullScreen;
        this.fixWindowDirective.onResize();
    }

    startSync() {
        this.selectUserComp.registerOnChange(function (selectedUsers) {
            this.selectedUsers = selectedUsers;
            const map = this.selectedUsers.length === 0 ? this.map : null;
            this.onlineUsers.forEach((user) => {
                user.setMap(map);
            });
            this.selectedUsers.forEach((user) => {
                user.setMap(this.map);
            });
            this.fitBounds();
        }.bind(this));

        this.queryTimer = TimerObservable.create(1000, this.queryInterval).takeWhile(() => this.timerAlive)
            .subscribe(() => {
                let err = true;
                this.http.get(server.apis.rt.all).finally(() => {
                    if (err) {
                        this.ngOnDestroy();
                    }
                }).subscribe((res: HttpRes) => {
                    if (res.code === server.successCode) {
                        // 下线检测
                        this.processOffLine();
                        for (let i = 0; i < res.data.length; ++i) {
                            this.processUser(res.data[i]);
                        }
                    }
                    err = false;
                });
            });
    }

    processOffLine() {
        for (let i = this.onlineUsers.length - 1; i >= 0; i--) {
            const user = this.onlineUsers[i];
            if (this.isOffLine(user)) {
                this.onlineUsers.splice(i, 1);
                if (this.curUser === user) {
                    this.curUser = {};
                }
                this.msgSrv.info(`${user.userName}下线了`);
            }
        }
    }

    isOffLine(user) {
        return moment().valueOf() > moment(user.time).add(this.selectedTime.value, 'minute').valueOf();
    }

    processUser(user: any) {
        if (!this.isOffLine(user)) {
            let i = 0;
            for (; i < this.onlineUsers.length; ++i) {
                const onlineUser = this.onlineUsers[i];
                if (user.userId === onlineUser.userId) {
                    if (Utils.equals(user, onlineUser)) {
                        return;
                    }
                    // 位置更新
                    for (const key in user) {
                        if (user.hasOwnProperty(key)) {
                            onlineUser[key] = user[key];
                        }
                    }
                    onlineUser.position = this.mapSrv.latLng(onlineUser);
                    onlineUser.draw();

                    this.zone.run(() => {
                        this.msgSrv.info(`${user.userName}在${user.time.substr(11)}位置更新了`);
                    });
                    this.fitBounds();
                    break;
                }
            }
            if (i === this.onlineUsers.length) {// 上线
                const newUser = new UserOverlay(user, this.colorSrv.nextColor());
                this.onlineUsers.push(newUser);
                newUser.position = this.mapSrv.latLng(newUser);
                this.zone.run(() => {
                    this.msgSrv.info(`${user.userName}在${user.time.substr(11)}上线了`);
                });
                if (this.selectedUsers.length > 0) {
                    return;
                }
                newUser.setMap(this.map);
                newUser.addListener('onmouseenter', function () {
                    this.zone.run(() => {
                        this.curUser = newUser;
                    });
                }.bind(this));
                this.fitBounds();
            }
        }
    }

    fitBounds() {
        if (this.autoAdjust) {
            let bounds;
            const showUsers = this.selectedUsers.length === 0 ? this.onlineUsers : this.selectedUsers;
            showUsers.forEach(overlay => {
                const position = this.mapSrv.latLng(overlay);
                const bound = new google.maps.LatLngBounds(position, position);
                bounds = bounds ? bounds.union(bound) : bound;
            });
            if (bounds) {
                try {
                    this.map.panTo(bounds.getCenter());
                    this.map.fitBounds(bounds);
                } catch (ex) {
                }
            }
        }
    }

    closeToggle() {
        this.rightClose = !this.rightClose;
    }

    ngOnDestroy(): void {
        this.timerAlive = false;
        if (this.queryTimer) {
            this.queryTimer.unsubscribe();
            this.queryTimer = null;
        }
        this.onlineUsers.forEach((user) => {
            user.setMap(null);
        });
        this.onlineUsers = [];
    }
}

function UserOverlay(user, options) {
    google.maps.OverlayView.call(this);
    this.options = options;
    this.disabled = false;
    this.evts = {};
    for (const key in user) {
        if (user.hasOwnProperty(key)) {
            this[key] = user[key];
        }
    }
}

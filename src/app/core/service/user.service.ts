import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import {AppService, server} from './app.service';
import {HttpRes} from '../model/http-res';
import {isString} from 'util';
import {ActivatedRoute, Router} from '@angular/router';
import {SettingsService} from '@delon/theme';
import {NzModalService} from 'ng-zorro-antd';
import * as moment from 'moment';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

@Injectable()
export class UserService {
    private readonly userKey = 'user';
    private storage: Storage = localStorage;
    private tokenRefreshTimer;
    private timerAlive;

    constructor(private http: HttpClient, private appService: AppService, private settingsService: SettingsService,
                private router: Router, private route: ActivatedRoute, private modalSrv: NzModalService) {
    }

    login(account: string, password: string, success: Function, fail: Function): void {
        this.http.post(server.apis.noAuth.login, {
            account: account,
            password: password
        }).subscribe((res: HttpRes) => {
                if (server.successCode === res.code) {
                    const time = moment();
                    this.updateUser({...res.data.user,
                        token: res.data.token,
                        webLoginTime: time.format('YYYY-MM-DD HH:mm:ss'),
                        refreshTokenTime: time.valueOf()
                    });
                    this.appService.onlineError = false;
                    this.startRefreshTokenTimer();
                    success();
                } else {
                    fail();
                }
            });
    }

    private startRefreshTokenTimer() {
        const user = this.getUser();
        if (user.refreshTokenTime) {
            this.timerAlive = true;
            const refreshTime = this.appService.getTokenConfig().expiration - 1000 * 5;
            const initDelay = Math.max(500, refreshTime - moment().valueOf() + user.refreshTokenTime);
            this.tokenRefreshTimer = TimerObservable.create(initDelay, refreshTime).takeWhile(() => this.timerAlive)
                .subscribe(() => {
                    this.http.get(server.apis.user.refreshToken).subscribe((res: HttpRes) => {
                        if (res.code === server.successCode) {
                            this.updateUser({
                                token: res.data.token,
                                refreshTokenTime: moment().valueOf()
                            });
                        }
                    });
                });
        }

    }

    private stopRefreshTokenTimer() {
        this.timerAlive = false;
        if (this.tokenRefreshTimer) {
            this.tokenRefreshTimer.unsubscribe();
        }
    }

    verifyToken(): Observable<any> {
        return Observable.fromPromise(new Promise((resolve, reject) => {
            const user = this.getUser();
            if (user.refreshTokenTime && user.refreshTokenTime + this.appService.getTokenConfig().expiration < moment().valueOf()) {
                this.http.get(server.apis.user.verifyToken).subscribe(() => {
                    resolve(user);
                });
            } else {
                resolve(user);
            }
        }));
    }

    logout(redirectUrl?: string) {
        // 退出状态，不需要报错
        this.appService.onlineError = true;
        this.storage.removeItem(this.userKey);
        this.stopRefreshTokenTimer();
        this.router.navigate(['passport/login'], {
            queryParams: {redirectUrl: redirectUrl || this.router.url},
            relativeTo: this.route
        });
    }

    needLogin() {
        this.errorMask('已注销,请重新登录', () => this.logout());
    }

    timeout() {
        this.errorMask('会话超时,请重新登录', () => this.logout());
    }

    errorMask(content: string, onOk: () => void) {
        if (!this.appService.onlineError) {
            this.appService.onlineError = true;
            this.modalSrv.error({
                title: '错误',
                closable: false,
                content: content,
                maskClosable: false,
                okText: '确定',
                onOk: onOk
            });
        }
    }

    isLogin(): boolean {
        return isString(this.getUser().token);
    }

    getTokenHeader(): any {
        const header = {};
        const token = this.appService.getTokenConfig();
        if (token.header) {
            header[`${token.header}`] = `${token.head}${this.getToken()}`;
        }
        return header;
    }

    getTokenQuery(): any {
        const params = {};
        const token = this.appService.getTokenConfig();
        if (token.header) {
            params[`${token.queryParam}`] = `${token.head}${this.getToken()}`;
        }
        return params;
    }

    updateUser(user: any) {
        user = {...this.getUser(), ...user};
        this.settingsService.setUser(user);
        this.storage.setItem(this.userKey, JSON.stringify(user));
    }

    getUser(): any {
        const userStr = this.storage.getItem(this.userKey);
        if (userStr) {
            return JSON.parse(userStr);
        }
        return {};
    }

    private getToken(): string {
        return this.getUser().token || '';
    }
}

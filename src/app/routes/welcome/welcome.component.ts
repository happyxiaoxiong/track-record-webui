import { Component, OnInit } from '@angular/core';
import {UserService} from '@core/service/user.service';

@Component({
    selector: 'app-welcome',
    template: `
        <nz-alert [nzType]="'info'" [nzMessage]="message()" [nzDescription]="description()" nzShowIcon class="pt-lg"></nz-alert>
      `,
})
export class WelcomeComponent implements OnInit {
    private user;
    constructor(private userSrv: UserService) {
        this.user = this.userSrv.getUser();
    }

    ngOnInit() {
    }

    message() {
        return `${this.user.name},欢迎登录到本系统`;
    }

    description() {
        return `本次登录系统时间是:${this.user.loginSysTime}`;
    }
}


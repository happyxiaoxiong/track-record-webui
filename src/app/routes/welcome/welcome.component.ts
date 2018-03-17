import { Component} from '@angular/core';
import {UserService} from '@core/service/user.service';

@Component({
    selector: 'app-welcome',
    template: `
        <nz-alert [nzType]="'info'" [nzMessage]="message()" [nzDescription]="description()" nzShowIcon class="pt-lg"></nz-alert>
      `,
})
export class WelcomeComponent {
    private user: any = {};
    constructor(private userSrv: UserService) {
        this.userSrv.verifyToken().subscribe((res) => {
            this.user = res;
        });
    }

    message() {
        return `欢迎使用本系统`;
    }

    description() {
        return `本次登录系统时间是:${this.user.webLoginTime}`;
    }
}


import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-welcome',
    template: `
        <nz-alert [nzType]="'info'" [nzMessage]="message()" [nzDescription]="description()" nzShowIcon class="pt-lg"></nz-alert>
      `,
})
export class WelcomeComponent implements OnInit {

    loginTime = moment().format('YYYY-MM-DD HH:mm:ss');
    constructor() { }

    ngOnInit() {
    }

    message() {
        return `欢迎登录到本系统`;
    }

    description() {
        return `登录时间:${this.loginTime}`;
    }
}


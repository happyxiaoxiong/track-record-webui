import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '@delon/theme';
import {UserService} from "@core/service/user.service";

@Component({
    selector: 'header-user',
    template: `
    <nz-dropdown nzPlacement="bottomRight">
        <div class="item d-flex align-items-center px-sm" nz-dropdown>
            <nz-avatar [nzIcon]="'user'" nzSize="small" class="mr-sm"></nz-avatar>
            {{user.name}}
        </div>
        <ul nz-menu class="width-sm">
            <li nz-menu-item><a [routerLink]="['/profile']" style="display: block"><i class="anticon anticon-user mr-sm"></i>{{ 'profile' | translate }}</a></li>
            <li nz-menu-divider></li>
            <li nz-menu-item (click)="logout()"><i class="anticon anticon-logout mr-sm"></i>{{ 'logout' | translate }}</li>
        </ul>
    </nz-dropdown>
    `
})
export class HeaderUserComponent implements OnInit {
    user: any;
    constructor(
        public settings: SettingsService,
        private router: Router,
        private userSrv: UserService) {
        this.user = userSrv.getUser();
    }

    ngOnInit(): void {
    }

    logout() {
        this.userSrv.logout();
    }
}

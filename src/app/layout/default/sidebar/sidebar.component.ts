import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import {UserService} from '@core/service/user.service';

@Component({
  selector   : 'app-sidebar',
  template: `<div class="aside-inner">
      <nz-dropdown nzTrigger="click" class="user-block clearfix">
          <div nz-dropdown class="user-block-dropdown">
              <nz-avatar class="avatar" [nzIcon]="'user'" [nzSize]="'large'"></nz-avatar>
              <div class="info">
                  <strong>{{user.name}}</strong>
                  <p class="text-truncate">{{user.email}}</p>
              </div>
          </div>
          <ul nz-menu>
              <li nz-menu-item (click)="msgSrv.success('profile')">{{ 'profile' | translate }}</li>
              <li nz-menu-item (click)="msgSrv.success('settings')">{{ 'settings' | translate }}</li>
              <li nz-menu-item (click)="logout()">{{ 'logout' | translate }}</li>
          </ul>
      </nz-dropdown>
      <sidebar-nav class="d-block py-lg"></sidebar-nav>
  </div>
  `
})
export class SidebarComponent {
    user: any;
    constructor(public settings: SettingsService, public msgSrv: NzMessageService, private userSrv: UserService) {
        this.user = userSrv.getUser();
    }

    logout() {
        this.userSrv.logout();
    }
}

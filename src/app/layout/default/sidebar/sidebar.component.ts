import { Component } from '@angular/core';
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
              <li nz-menu-item><a [routerLink]="['/profile']" style="display: block"><i class="anticon anticon-user mr-sm"></i>{{ 'profile' | translate }}</a></li>
              <li nz-menu-divider></li>
              <li nz-menu-item (click)="logout()"><i class="anticon anticon-logout mr-sm"></i>{{ 'logout' | translate }}</li>
          </ul>
      </nz-dropdown>
      <sidebar-nav class="d-block py-lg"></sidebar-nav>
  </div>
  `
})
export class SidebarComponent {
    user: any;
    constructor(private userSrv: UserService) {
        this.user = userSrv.getUser();
    }

    logout() {
        this.userSrv.logout();
    }
}

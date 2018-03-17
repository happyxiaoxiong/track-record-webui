import { Component } from '@angular/core';
import { Router, NavigationEnd, RouteConfigLoadStart, NavigationError } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { ScrollService, MenuService, SettingsService } from '@delon/theme';

@Component({
    selector: 'layout-default',
    template: `
        <div class="wrapper">
            <div class="router-progress-bar" *ngIf="isFetching"></div>
            <app-header class="header"></app-header>
            <app-sidebar class="aside"></app-sidebar>
            <section class="content">
                <reuse-tab></reuse-tab>
                <router-outlet></router-outlet>
            </section>
        </div>
    `
})
export class LayoutDefaultComponent {
    isFetching = false;

    constructor(
        router: Router,
        scroll: ScrollService,
        private msgSrv: NzMessageService) {
        // scroll to top in change page
        router.events.subscribe(evt => {
            if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
                this.isFetching = true;
            }
            if (evt instanceof NavigationError) {
                this.isFetching = false;
                msgSrv.error(`无法加载${evt.url}路由`, { nzDuration: 1000 * 3 });
                return;
            }
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            setTimeout(() => {
                scroll.scrollToTop();
                this.isFetching = false;
            }, 100);
        });
    }
}

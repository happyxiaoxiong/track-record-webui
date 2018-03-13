import { Component} from '@angular/core';
import { SettingsService } from '@delon/theme';

@Component({
    selector: 'app-header',
    template: `
        <div class="logo">
            <a [routerLink]="['/']">
                <img class="expanded" src="./assets/img/logo.svg" alt="{{settings.app.name}}" style="max-height:40px;" />
                <img class="collapsed" src="./assets/img/logo.svg" alt="{{settings.app.name}}" style="max-height:30px;" />
            </a>
        </div>
        <div class="top-nav-wrap">
            <ul class="top-nav">
                <!-- Menu -->
                <li>
                    <div class="item" (click)="toggleCollapsedSideabar()">
                        <i class="anticon anticon-menu-{{settings.layout.collapsed ? 'unfold' : 'fold'}}"></i>
                    </div>
                </li>
            </ul>
            <ul class="top-nav">
                <li class="hidden-xs">
                    <nz-dropdown nzTrigger="click" nzPlacement="bottomRight">
                        <div class="item" nz-dropdown>
                            <i class="anticon anticon-setting"></i>
                        </div>
                        <div nz-menu style="width:200px">
                            <div nz-menu-item class="theme-switch">
                                <header-theme></header-theme>
                            </div>
                            <div nz-menu-item>
                                <header-fullscreen></header-fullscreen>
                            </div>
                        </div>
                    </nz-dropdown>
                </li>
                <li class="hidden-xs">
                    <header-user></header-user>
                </li>
            </ul>
        </div>
    `
})
export class HeaderComponent {
    searchToggleStatus: boolean;

    constructor(public settings: SettingsService) { }

    toggleCollapsedSideabar() {
        this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
    }

    searchToggleChange() {
        this.searchToggleStatus = !this.searchToggleStatus;
    }

}

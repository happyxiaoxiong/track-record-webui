import { Component, HostListener } from '@angular/core';
import * as screenfull from 'screenfull';

@Component({
    selector: 'header-fullscreen',
    template: `<span style="display: block">
        <i class="anticon anticon-{{status ? 'shrink' : 'arrows-alt'}}"></i>
        {{(status ? 'fullscreen-exit' : 'fullscreen') | translate }}
    </span>
    
    `
})
export class HeaderFullScreenComponent {

    status = false;

    @HostListener('window:resize') onResize() {
        this.status = screenfull.isFullscreen;
    }

    @HostListener('click')
    _click() {
        if (screenfull.enabled) {
            screenfull.toggle();
        }
    }
}

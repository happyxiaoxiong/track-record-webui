import {AfterViewInit, Directive, ElementRef, HostBinding, HostListener, Input, Renderer2} from '@angular/core';

@Directive({
    selector: '[autoSizeHeight]'
})
export class AutoSizeHeightDirective implements AfterViewInit {
    @HostBinding('style.height.px') height = 400;
    @Input() ratio = 1; // height / width
    @HostListener('window:resize') onResize() {
        this.height = this.el.nativeElement.offsetWidth * this.ratio;
    }

    constructor(private el: ElementRef, private ren2: Renderer2) {
    }

    ngAfterViewInit() {
        // fix bug: Expression has changed after it was checked.
        setTimeout(() => this.onResize(), 500);
    }
}

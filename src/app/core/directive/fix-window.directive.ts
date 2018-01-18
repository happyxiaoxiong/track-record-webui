import {AfterViewInit, Directive, ElementRef, HostBinding, HostListener, Inject, Input, Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Directive({
    selector: '[fixWindow]'
})
export class FixWindowDirective implements AfterViewInit {
    private bodyEl;
    @Input() marginBottom = 24;
    @Input() minWidth = 400;
    @HostBinding('style.height.px') height = 400;

    @HostListener('window:resize') onResize() {
        // 窗口自适应大小
        let height = this.bodyEl.getBoundingClientRect().height - this.el.nativeElement.getBoundingClientRect().top - this.marginBottom;
        if (height < this.minWidth) {
            height = this.minWidth;
        }
        this.height = height;
    }

    constructor(private el: ElementRef, private ren2: Renderer2, @Inject(DOCUMENT) private doc: Document) {
    }

    ngAfterViewInit() {
        this.bodyEl = this.doc.querySelector('body');
        // fix bug: Expression has changed after it was checked.
        setTimeout(() => this.onResize(), 500);
    }
}

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-move-animate',
  template: '<nz-tag [nzColor]="color">{{ text }}</nz-tag>',
})
export class MoveAnimateComponent implements OnInit {

    @Input() color = 'cyan';
    @Input() text = 1;
    constructor(
    ) { }

    ngOnInit() {
    }

}

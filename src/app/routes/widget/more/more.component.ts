import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-more',
  template: `<ng-container *ngIf="text.length > cutLen">
      <nz-tooltip >
          <a nz-tooltip>{{ text.substr(0, cutLen)}}...</a>
          <ng-template #nzTemplate>
              <span>{{ text }}</span>
          </ng-template>
      </nz-tooltip>
  </ng-container> 
  <span *ngIf="text.length <= cutLen">{{ text }}</span>`,
})
export class MoreComponent implements OnInit {

    @Input() cutLen = 8;
    @Input() text: string;
    constructor(
    ) { }

    ngOnInit() {
    }

}

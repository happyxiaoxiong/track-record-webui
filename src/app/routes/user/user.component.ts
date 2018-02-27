import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-user',
  template: `
      <nz-card [nzTitle]="'密码修改'">
          
      </nz-card>
  `,
})
export class UserComponent implements OnInit {

    constructor(
        private http: HttpClient
    ) { }

    ngOnInit() {
    }

}

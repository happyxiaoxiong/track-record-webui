import {AfterViewInit, Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-stat',
    template: `
      `,
    styles: []
})
export class StatComponent implements OnInit, AfterViewInit {


    constructor(private http: HttpClient) {
    }

    ngOnInit() {

    }

    _onReuseInit() {
        // this.listComp.search();
    }

    ngAfterViewInit(): void {
    }
}

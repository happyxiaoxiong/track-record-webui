import {Injectable, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HistoryService {
    private switchSubject = new Subject<any>();
    constructor() {
    }

    notifySwitch(track) {
        this.switchSubject.next(track);
    }

    getSwitchObservable(): Observable<any> {
        return this.switchSubject.asObservable();
    }

}

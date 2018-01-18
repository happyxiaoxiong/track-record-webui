import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class FileUploadService {
    private fileUploadedSubject = new Subject();
    constructor() {
    }

    notifyFileUploaded() {
        this.fileUploadedSubject.next();
    }

    getFileUploadedObservable(): Observable<any> {
        return this.fileUploadedSubject.asObservable();
    }
}

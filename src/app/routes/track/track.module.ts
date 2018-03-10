import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TrackRoutingModule} from './track-routing.module';
import {FileUploadComponent} from './file-upload/file-upload.component';
import {HistoryComponent} from './history/history.component';
import {SharedModule} from '@shared/shared.module';
import { UploadComponent } from './file-upload/upload/upload.component';
import { LastWeekStateComponent } from './file-upload/last-week-state/last-week-state.component';
import {FileUploadService} from './file-upload/file-upload.service';
import {ListComponent} from './history/list/list.component';
import {HistoryService} from './history/history.service';
import {StatComponent} from './stat/stat.component';
import {NgxEchartsModule} from 'ngx-echarts';
import {DescComponent} from './history/desc/desc.component';
import {QqMapComponent} from './history/qq-map/qq-map.component';
import { GoogleMapComponent } from './history/google-map/google-map.component';

@NgModule({
    imports: [
        CommonModule,
        TrackRoutingModule,
        SharedModule,
        NgxEchartsModule
    ],
    entryComponents: [DescComponent],
    providers: [
        FileUploadService, HistoryService
    ],
    declarations: [FileUploadComponent, UploadComponent, LastWeekStateComponent, HistoryComponent, ListComponent, QqMapComponent, DescComponent, StatComponent, GoogleMapComponent]
})
export class TrackModule {
}

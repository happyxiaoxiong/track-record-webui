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
import {MapComponent} from './history/map/map.component';
import {HistoryService} from './history/history.service';

@NgModule({
    imports: [
        CommonModule,
        TrackRoutingModule,
        SharedModule
    ],
    providers: [
        FileUploadService, HistoryService
    ],
    declarations: [FileUploadComponent, UploadComponent, LastWeekStateComponent, HistoryComponent, ListComponent, MapComponent]
})
export class TrackModule {
}

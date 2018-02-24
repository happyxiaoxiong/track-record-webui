import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FileUploadComponent} from './file-upload/file-upload.component';
import {HistoryComponent} from './history/history.component';
import {StatComponent} from './stat/stat.component';

const routes: Routes = [
    { path: 'file-upload', component: FileUploadComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'stat', component: StatComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackRoutingModule { }

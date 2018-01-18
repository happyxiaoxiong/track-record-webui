import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FileUploadComponent} from './file-upload/file-upload.component';
import {HistoryComponent} from './history/history.component';

const routes: Routes = [
    { path: 'file-upload', component: FileUploadComponent },
    { path: 'history', component: HistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackRoutingModule { }

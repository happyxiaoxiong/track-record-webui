import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {QqMapComponent} from './qq-map/qq-map.component';
import {GoogleMapComponent} from './google-map/google-map.component';

const routes: Routes = [
    {
        path: '',
        component: GoogleMapComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealtimePositionRoutingModule { }

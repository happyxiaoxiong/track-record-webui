import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RealtimePositionComponent} from "./realtime-position.component";

const routes: Routes = [
    {
        path: '',
        component: RealtimePositionComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealtimePositionRoutingModule { }

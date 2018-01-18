import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealtimePositionRoutingModule } from './realtime-position-routing.module';
import { RealtimePositionComponent } from './realtime-position.component';

@NgModule({
  imports: [
    CommonModule,
    RealtimePositionRoutingModule
  ],
  declarations: [RealtimePositionComponent]
})
export class RealtimePositionModule { }

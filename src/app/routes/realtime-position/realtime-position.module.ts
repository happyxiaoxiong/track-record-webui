import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealtimePositionRoutingModule } from './realtime-position-routing.module';
import { RealtimePositionComponent } from './realtime-position.component';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RealtimePositionRoutingModule
    ],
    declarations: [RealtimePositionComponent]
})
export class RealtimePositionModule { }

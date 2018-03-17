import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealtimePositionRoutingModule } from './realtime-position-routing.module';
import {SharedModule} from '@shared/shared.module';
import { QqMapComponent } from './qq-map/qq-map.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import {RealtimePositionComponent} from './realtime-position.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RealtimePositionRoutingModule
    ],
    declarations: [RealtimePositionComponent, QqMapComponent, GoogleMapComponent]
})
export class RealtimePositionModule { }

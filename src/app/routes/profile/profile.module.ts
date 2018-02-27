import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule} from '@shared/shared.module';
import {ProfileComponent} from './profile.component';
import {ProfileRoutingModule} from './profile-routing.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ProfileRoutingModule
    ],
    declarations: [ProfileComponent]
})
export class ProfileModule { }

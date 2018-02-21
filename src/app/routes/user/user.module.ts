import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {UserRoutingModule} from './user-routing.module';
import {SharedModule} from '@shared/shared.module';
import {UserComponent} from './user.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UserRoutingModule
    ],
    declarations: [UserComponent]
})
export class UserModule { }

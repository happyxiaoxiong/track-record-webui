import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';

import { MaintenanceComponent } from './maintenance/maintenance.component';

@NgModule({
  imports: [ SharedModule, PagesRoutingModule ],
  declarations: [
    MaintenanceComponent
  ]
})
export class PagesModule { }

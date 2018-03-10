import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from './module-import-guard';

import { I18NService } from './i18n/i18n.service';
import {AppService} from '@core/service/app.service';
import {UserService} from '@core/service/user.service';
import {AuthGuard} from '@core/guard/auth.guard';
import {JsLoadService} from '@core/service/js-load.service';
import {ColorService} from '@core/service/color.service';
import {MapService} from '@core/service/map.service';
import {GoogleMapHelper} from '@core/map/google-map-helper';
import {QqMapHelper} from '@core/map/qq-map-helper';

@NgModule({
    providers: [
        I18NService,
        AppService,
        UserService,
        {
            provide: MapService,
            useFactory: () => {
                return new MapService(new GoogleMapHelper());
            }
        },
        ColorService,
        JsLoadService,
        AuthGuard
    ],
    declarations: []
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}

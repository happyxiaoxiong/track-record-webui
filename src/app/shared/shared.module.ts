import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// delon
import { NgZorroAntdExtraModule } from 'ng-zorro-antd-extra';
import { AlainThemeModule } from '@delon/theme';
import { AlainACLModule } from '@delon/acl';
import { ZORROMODULES, ABCMODULES } from '../delon.module';
// i18n
import { TranslateModule } from '@ngx-translate/core';

// region: third libs
import { CountdownModule } from 'ngx-countdown';
import {ByteFormatPipe} from '@core/pipe/byte-format.pipe';
import {MeterFormatPipe} from '@core/pipe/meter-format.pipe';
import {MoreComponent} from '../routes/widget/more/more.component';
import {AqmModule} from 'angular-qq-maps';
import {FixWindowDirective} from '@core/directive/fix-window.directive';
import {MoveAnimateComponent} from '../routes/widget/move-animate/move-animate.component';
import {AutoSizeHeightDirective} from '@core/directive/auto-size-height.directive';
import {TimeFormatPipe} from '@core/pipe/time-format.pipe';
import {QQ_MAP_KEY} from '@core/service/app.service';
import {GoogleMapsModule} from 'google-maps-angular2';

const THIRDMODULES = [
    CountdownModule,
    // VgCoreModule,
    // VgControlsModule,
    // VgOverlayPlayModule,
    // VgBufferingModule
];
// endregion

// region: your componets & directives
const COMPONENTS = [
    MoreComponent,
    MoveAnimateComponent

];
const DIRECTIVES = [
    ByteFormatPipe,
    MeterFormatPipe,
    TimeFormatPipe,
    FixWindowDirective,
    AutoSizeHeightDirective
];
// endregion

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        ...ZORROMODULES,
        NgZorroAntdExtraModule,
        AlainThemeModule.forChild(),
        ...ABCMODULES,
        AlainACLModule,
        // third libs
        ...THIRDMODULES,
        AqmModule.forRoot({
            apiKey: QQ_MAP_KEY, // app key为必选项
            apiLibraries: ['convertor']
        }),
        GoogleMapsModule.forRoot({
            url: 'http://maps.google.cn/maps/api/js?key=AIzaSyCsCA2URDIMpFVDhPFI_irAyu5LTRtis70&libraries=places'
        })
    ],
    declarations: [
        // your components
        ...COMPONENTS,
        ...DIRECTIVES
    ],
    entryComponents: [
        MoveAnimateComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ...ZORROMODULES,
        NgZorroAntdExtraModule,
        AlainThemeModule,
        ...ABCMODULES,
        // i18n
        TranslateModule,
        // third libs
        ...THIRDMODULES,
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        AqmModule,
        GoogleMapsModule
    ]
})
export class SharedModule { }

/**
 * 进一步对基础模块的导入提炼
 * 有关模块注册指导原则请参考：https://github.com/cipchk/ng-alain/issues/180
 */
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from '@core/module-import-guard';

// region: zorro modules

import {
    NzButtonModule,
    NzAlertModule,
    NzAffixModule,
    NzBadgeModule,
    NzCascaderModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzGridModule,
    NzMessageModule,
    NzModalModule,
    NzNotificationModule,
    NzPaginationModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzRadioModule,
    NzRateModule,
    NzSelectModule,
    NzSpinModule,
    NzSliderModule,
    NzSwitchModule,
    NzProgressModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTimePickerModule,
    NzUtilModule,
    NzStepsModule,
    NzDropDownModule,
    NzMenuModule,
    NzBreadCrumbModule,
    NzLayoutModule,
    NzRootModule,
    NzCarouselModule,
    NzCollapseModule,
    NzTimelineModule,
    NzToolTipModule,
    NzAvatarModule,
} from 'ng-zorro-antd';
export const ZORROMODULES = [
    NzButtonModule,
    NzAlertModule,
    NzBadgeModule,
    NzAffixModule,
    NzCascaderModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzGridModule,
    NzMessageModule,
    NzModalModule,
    NzNotificationModule,
    NzPaginationModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzRadioModule,
    NzRateModule,
    NzSelectModule,
    NzSpinModule,
    NzSliderModule,
    NzSwitchModule,
    NzProgressModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTimePickerModule,
    NzUtilModule,
    NzStepsModule,
    NzDropDownModule,
    NzMenuModule,
    NzBreadCrumbModule,
    NzLayoutModule,
    NzRootModule,
    NzCarouselModule,
    NzCollapseModule,
    NzTimelineModule,
    NzToolTipModule,
    NzAvatarModule
];
// endregion

// region: @delon/abc modules
import {
    AdFullContentModule,
    AdGlobalFooterModule,
    AdSidebarNavModule,
    AdReuseTabModule, AdExceptionModule,
} from '@delon/abc';
export const ABCMODULES = [
    AdReuseTabModule,
    AdSidebarNavModule,
    AdGlobalFooterModule,
    AdFullContentModule,
    AdExceptionModule,
];
// endregion

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NgZorroAntdExtraModule } from 'ng-zorro-antd-extra';
import { AlainThemeModule } from '@delon/theme';


@NgModule({
    imports: [
        NgZorroAntdModule.forRoot(),
        NgZorroAntdExtraModule.forRoot(),
        // theme
        AlainThemeModule.forRoot(),
        // abc
        AdSidebarNavModule.forRoot(),
        AdReuseTabModule.forRoot(),
        AdGlobalFooterModule.forRoot(),
        AdFullContentModule.forRoot(),
        AdExceptionModule.forRoot(),
    ]
})
export class DelonModule {
  constructor( @Optional() @SkipSelf() parentModule: DelonModule) {
    throwIfAlreadyLoaded(parentModule, 'DelonModule');
  }
}

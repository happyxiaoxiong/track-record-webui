import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { zip } from 'rxjs/observable/zip';
import { TranslateService } from '@ngx-translate/core';
import { MenuService, SettingsService, TitleService } from '@delon/theme';
// import { ACLService } from '@delon/acl';
import { I18NService } from '../i18n/i18n.service';
import { server, AppService } from "@core/service/app.service";

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
    constructor(
        private menuService: MenuService,
        private translate: TranslateService,
        private i18n: I18NService,
        private settingService: SettingsService,
        // private aclService: ACLService,
        private titleService: TitleService,
        private http: HttpClient,
        private appService: AppService,
        private injector: Injector) { }

    load(): Promise<any> {
        // only works with promises
        // https://github.com/angular/angular/issues/15088
        return new Promise((resolve, reject) => {
            zip(
                this.http.get(`assets/i18n/${this.i18n.defaultLang}.json`),
                this.http.get('assets/app-data.json'),
                this.http.get(server.apis.config)
            ).subscribe(([langData, appData, appConfigData]) => {
                // setting language data
                this.translate.setTranslation(this.i18n.defaultLang, langData);
                this.translate.setDefaultLang(this.i18n.defaultLang);

                // application data
                const res: any = appData;
                // 应用信息：包括站点名、描述、年份
                this.settingService.setApp(res.app);
                this.settingService.setLayout('theme', res.theme);
                // ACL：设置权限为全量
                // this.aclService.setFull(true);
                // 初始化菜单
                this.menuService.add(res.menu);
                // 设置页面标题的后缀
                this.titleService.suffix = res.app.name;

                const config: any = appConfigData;
                this.appService.setConfig(config.data);
                resolve(res);
            }, (err: HttpErrorResponse) => {
                resolve(null);
            });
        });
    }
}

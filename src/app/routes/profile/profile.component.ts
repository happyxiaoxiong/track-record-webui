import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';
import {UserService} from '@core/service/user.service';
import {server} from '@core/service/app.service';
import {HttpRes} from '@core/model/http-res';

@Component({
    selector: 'app-profile',
    template: `
        <div nz-row [nzGutter]="16" class="py-lg">
            <div nz-col [nzSpan]="6">
                <nz-card nzTitle="个人设置" nzNoPadding>
                    <a (click)="active=1" class="d-block py-sm px-md"
                       [ngClass]="{'bg-primary-light text-white':active===1}">个人资料</a>
                    <a (click)="active=2" class="d-block py-sm px-md"
                       [ngClass]="{'bg-primary-light text-white':active===2}">账号</a>
                </nz-card>
            </div>
            <div nz-col [nzSpan]="18">
                <nz-card nzTitle="资料信息" *ngIf="active===1">
                    <div nz-row>
                        <div nz-col [nzSpan]="24">
                            <form nz-form [formGroup]="profileForm" (ngSubmit)="profileSave()" [nzLayout]="'vertical'">
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="name" nz-form-item-required>账户名</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="account">
                                        <nz-input formControlName="account" [nzId]="'account'" required></nz-input>
                                        <ng-container *ngIf="account.dirty || account.touched">
                                            <p nz-form-explain *ngIf="account.errors?.required">请输入账户名！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="name" nz-form-item-required>姓名</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="name">
                                        <nz-input formControlName="name" [nzId]="'name'" required></nz-input>
                                        <ng-container *ngIf="name.dirty || name.touched">
                                            <p nz-form-explain *ngIf="name.errors?.required">请输入姓名！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="gender" nz-form-item-required>性别</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="gender">
                                        <nz-select formControlName="gender">
                                            <nz-option [nzLabel]="'保密'" [nzValue]="'保密'"></nz-option>
                                            <nz-option [nzLabel]="'男'" [nzValue]="'男'"></nz-option>
                                            <nz-option [nzLabel]="'女'" [nzValue]="'女'"></nz-option>
                                        </nz-select>
                                        <ng-container *ngIf="gender.dirty || gender.touched">
                                            <p nz-form-explain *ngIf="gender.errors?.required">请选择性别！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="birthday" nz-form-item-required>生日</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="birthday">
                                        <nz-datepicker formControlName="birthday" [nzPlaceHolder]="'生日'"
                                                       style="width: 100%;"></nz-datepicker>
                                        <ng-container *ngIf="birthday.dirty || birthday.touched">
                                            <p nz-form-explain *ngIf="birthday.errors?.required">请选择生日日期！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="organization" nz-form-item-required>工作单位</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="organization">
                                        <nz-input formControlName="organization" [nzId]="'organization'"
                                                  required></nz-input>
                                        <ng-container *ngIf="organization.dirty || organization.touched">
                                            <p nz-form-explain *ngIf="organization.errors?.required">请输入工作单位！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="country" nz-form-item-required>国家</label>
                                    </div>
                                    <div nz-form-control [nzValidateStatus]="country">
                                        <nz-input formControlName="country" [nzId]="'country'" required></nz-input>
                                        <ng-container *ngIf="country.dirty || country.touched">
                                            <p nz-form-explain *ngIf="country.errors?.required">请输入国家！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="province" nz-form-item-required>省份</label>
                                    </div>
                                    <div nz-form-control [nzValidateStatus]="province">
                                        <nz-input formControlName="province" [nzId]="'province'" required>></nz-input>
                                        <ng-container *ngIf="province.dirty || province.touched">
                                            <p nz-form-explain *ngIf="province.errors?.required">请输入省份！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="city" nz-form-item-required>城市</label>
                                    </div>
                                    <div nz-form-control [nzValidateStatus]="city">
                                        <nz-input formControlName="city" [nzId]="'city'" required>></nz-input>
                                        <ng-container *ngIf="city.dirty || city.touched">
                                            <p nz-form-explain *ngIf="city.errors?.required">请输入城市！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="county" nz-form-item-required>县</label>
                                    </div>
                                    <div nz-form-control [nzValidateStatus]="county">
                                        <nz-input formControlName="county" [nzId]="'county'" required>></nz-input>
                                        <ng-container *ngIf="county.dirty || county.touched">
                                            <p nz-form-explain *ngIf="county.errors?.required">请输入县！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="township" nz-form-item-required>乡镇</label>
                                    </div>
                                    <div nz-form-control [nzValidateStatus]="township">
                                        <nz-input formControlName="township" [nzId]="'township'" required>></nz-input>
                                        <ng-container *ngIf="township.dirty || township.touched">
                                            <p nz-form-explain *ngIf="township.errors?.required">请输入乡镇！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-row>
                                    <button nz-button [nzType]="'primary'" [disabled]="profileForm.invalid"
                                            [nzLoading]="loading">更新
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </nz-card>
                <nz-card nzTitle="密码修改" *ngIf="active===2">
                    <div nz-row>
                        <div nz-col [nzSpan]="24">
                            <form nz-form [formGroup]="pwdForm" [nzLayout]="'vertical'" (ngSubmit)="pwdSave()"
                                  role="form">
                                <!--防止自动填充-->
                                <input type="password" style="display:none">
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="oldPassword" nz-form-item-required>旧密码</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="oldPassword">
                                        <nz-input formControlName="oldPassword" [nzId]="'oldPassword'"
                                                  [nzType]="'password'" required></nz-input>
                                        <ng-container *ngIf="oldPassword.dirty || oldPassword.touched">
                                            <p nz-form-explain *ngIf="oldPassword.errors?.required">请输入旧密码！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="newPassword" nz-form-item-required>新密码</label>
                                    </div>
                                    <div nz-form-control [nzValidateStatus]="newPassword">
                                        <nz-popover [nzPlacement]="'right'" [nzTrigger]="'focus'"
                                                    [(nzVisible)]="visible" nzOverlayClassName="register-password-cdk"
                                                    [nzOverlayStyle]="{'width.px': 240}">
                                            <nz-input nz-popover formControlName="newPassword" (nzBlur)="visible=false" (nzFocus)="visible=true"
                                                      [nzPlaceHolder]="'至少6位密码，区分大小写'" [nzType]="'password'"></nz-input>
                                            <div nz-form-explain
                                                 *ngIf="(newPassword.dirty || newPassword.touched) && newPassword.errors?.required">
                                                请输入新密码！
                                            </div>
                                            <ng-template #nzTemplate>
                                                <div style="padding: 4px 0">
                                                    <ng-container [ngSwitch]="status">
                                                        <div *ngSwitchCase="'ok'" class="success">强度：强</div>
                                                        <div *ngSwitchCase="'pass'" class="warning">强度：中</div>
                                                        <div *ngSwitchDefault class="error">强度：弱</div>
                                                    </ng-container>
                                                    <div class="progress-{{status}}">
                                                        <nz-progress
                                                            [(ngModel)]="progress" [ngModelOptions]="{standalone: true}"
                                                            [nzStatus]="passwordProgressMap[status]"
                                                            [nzStrokeWidth]="6"
                                                            [nzShowInfo]="false"></nz-progress>
                                                    </div>
                                                    <p class="mt-sm">请至少输入 6 个字符。请不要使用容易被猜到的密码。</p>
                                                </div>
                                            </ng-template>
                                        </nz-popover>
                                    </div>
                                </div>
                                <div nz-form-item nz-row>
                                    <div nz-form-label nz-col>
                                        <label for="confirmNewPassword" nz-form-item-required>确认密码</label>
                                    </div>
                                    <div nz-form-control nz-col [nzValidateStatus]="confirmNewPassword">
                                        <nz-input formControlName="confirmNewPassword" [nzId]="'confirmNewPassword'"
                                                  [nzType]="'password'" required></nz-input>
                                        <ng-container *ngIf="confirmNewPassword.dirty || confirmNewPassword.touched">
                                            <p nz-form-explain *ngIf="confirmNewPassword.errors?.required">请确认密码！</p>
                                            <p nz-form-explain *ngIf="confirmNewPassword.errors?.equar">两次输入的密码不匹配！</p>
                                        </ng-container>
                                    </div>
                                </div>
                                <div nz-row>
                                    <button nz-button [nzType]="'primary'" [disabled]="pwdForm.invalid"
                                            [nzLoading]="loading">更新
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </nz-card>
            </div>
        </div>

    `,
})
export class ProfileComponent implements OnInit {
    loading = false;
    visible = false;
    status = 'pool';
    progress = 0;
    passwordProgressMap = {
        ok: 'success',
        pass: 'normal',
        pool: 'exception'
    };
    active = 1;
    pwdForm: FormGroup;
    profileForm: FormGroup;

    constructor(private fb: FormBuilder, private msg: NzMessageService, private http: HttpClient, private userSrv: UserService) {
    }

    ngOnInit() {
        this.pwdForm = this.fb.group({
            oldPassword: [null, [Validators.required]],
            newPassword: [null,  [Validators.required, Validators.minLength(6), this.checkPassword.bind(this)]],
            confirmNewPassword: [null, [Validators.required, Validators.minLength(6), this.passwordEquar]],
        });
        const user = this.userSrv.getUser();
        this.profileForm = this.fb.group({
            account: [{value: user.account, disabled: true}, [Validators.required]],
            name: [{value: user.name, disabled: true}, [Validators.required]],
            gender: [user.gender, [Validators.required]],
            birthday: [user.birthday, [Validators.required]],
            organization: [user.organization, [Validators.required]],
            country: [user.country, [Validators.required]],
            province: [user.province, [Validators.required]],
            city: [user.city, [Validators.required]],
            county: [user.county, [Validators.required]],
            township: [user.township, [Validators.required]],
        });
    }

    checkPassword(control: FormControl) {
        if (!control) return null;
        const self: any = this;
        self.visible = !!control.value;
        const alphaNum = /[a-zA-Z]/.test(control.value) && /\d/.test(control.value);
        if (alphaNum && control.value.length > 9)
            self.status = 'ok';
        else if (alphaNum && control.value.length > 5)
            self.status = 'pass';
        else
            self.status = 'pool';

        if (self.visible) self.progress = control.value.length * 10 > 100 ? 100 : control.value.length * 10;
    }

    passwordEquar(control: FormControl) {
        if (!control || !control.parent) return null;
        if (control.value !== control.parent.get('newPassword').value) {
            return {equar: true};
        }
        return null;
    }

// region: fields
    get oldPassword() {
        return this.pwdForm.controls.oldPassword;
    }

    get newPassword() {
        return this.pwdForm.controls.newPassword;
    }

    get confirmNewPassword() {
        return this.pwdForm.controls.confirmNewPassword;
    }

    get account() {
        return this.profileForm.controls.account;
    }

    get name() {
        return this.profileForm.controls.name;
    }

    get gender() {
        return this.profileForm.controls.gender;
    }

    get birthday() {
        return this.profileForm.controls.birthday;
    }

    get organization() {
        return this.profileForm.controls.organization;
    }

    get country() {
        return this.profileForm.controls.country;
    }

    get province() {
        return this.profileForm.controls.province;
    }

    get city() {
        return this.profileForm.controls.city;
    }

    get county() {
        return this.profileForm.controls.county;
    }

    get township() {
        return this.profileForm.controls.township;
    }

    // endregion

    pwdSave() {
        this.save(this.pwdForm, server.apis.user.changePassword);
    }

    profileSave() {
        this.save(this.profileForm, server.apis.user.changeProfile);
    }

    save(form, url) {
        for (const i in form.controls) {
            form.controls[i].markAsDirty();
        }
        if (form.invalid) {
            return;
        }
        this.loading = true;

        const params = {};
        for (const i in form.controls) {
            params[i] = form.controls[i].value;
        }

        this.http.post(url, params).subscribe((res: HttpRes) => {
            if (server.successCode === res.code) {
                const user = res.data.user;
                user.token = res.data.token;
                this.userSrv.setUser(user);
                this.msg.success('更新成功');
            } else {
                this.msg.error('更新失败');
            }
        }, () => {
            this.msg.error('服务器返回错误，请稍后重试');
        }, () => {
            this.loading = false;
        });
    }
}

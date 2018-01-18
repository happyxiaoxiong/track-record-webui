import { SettingsService } from '@delon/theme';
import { Component, OnDestroy, Inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { SocialService, SocialOpenType, ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { environment } from '@env/environment';
import {UserService} from "@core/service/user.service";

@Component({
    selector: 'passport-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.less' ],
})
export class UserLoginComponent implements OnDestroy {

    redirectUrl: string;
    form: FormGroup;
    error = '';
    loading = false;

    constructor(
        fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        public msg: NzMessageService,
        public userService: UserService) {
        this.form = fb.group({
            userName: [null, [Validators.required]],
            password: [null, Validators.required],
            remember: [true]
        });
        this.redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || 'home';
    }

    // region: fields

    get userName() { return this.form.controls.userName; }
    get password() { return this.form.controls.password; }

    submit() {
        this.userName.markAsDirty();
        this.password.markAsDirty();
        if (this.userName.invalid || this.password.invalid) return;

        this.loading = true;
        this.error = '';
        this.userService.login(this.userName.value, this.password.value, () => {
            this.router.navigate([this.redirectUrl]);
        }, () => {
            this.error = '账号或者密码不正确';
            this.loading = false;
        });
    }

    ngOnDestroy(): void {
    }
}

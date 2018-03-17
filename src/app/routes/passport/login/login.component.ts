import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {UserService} from '@core/service/user.service';

@Component({
    selector: 'passport-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.less' ],
})
export class UserLoginComponent {

    redirectUrl: string;
    form: FormGroup;
    error = '';
    loading = false;

    constructor(
        fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService) {
        this.form = fb.group({
            account: [null, [Validators.required]],
            password: [null, Validators.required],
            remember: [true]
        });
        this.redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || 'welcome';
    }

    // region: fields

    get account() { return this.form.controls.account; }
    get password() { return this.form.controls.password; }

    submit() {
        for (const i in this.form.controls) {
            this.form.controls[i].markAsDirty();
        }
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';
        this.userService.login(this.account.value, this.password.value, () => {
            this.router.navigate([this.redirectUrl]);
        }, () => {
            this.error = '账号或者密码不正确';
            this.loading = false;
        });
    }
}

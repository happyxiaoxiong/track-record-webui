import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HttpRes} from '@core/model/http-res';
import {server} from '@core/service/app.service';
import * as moment from 'moment';

@Component({
    selector: 'passport-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.less']
})
export class UserRegisterComponent {

    form: FormGroup;
    error = '';
    success = '';
    type = 0;
    loading = false;
    visible = false;
    status = 'pool';
    progress = 0;
    passwordProgressMap = {
        ok: 'success',
        pass: 'normal',
        pool: 'exception'
    };

    constructor(private fb: FormBuilder, private http: HttpClient) {
        this.form = this.fb.group({
            account: [null, [Validators.required], [this.accountUniqueValidate.bind(this)]],
            email: [null, [Validators.email]],
            password: [null, [Validators.required, Validators.minLength(6), this.checkPassword.bind(this)]],
            confirm: [null, [Validators.required, Validators.minLength(6), this.passwordEquar]],
            name: [null, [Validators.required]],
            gender: [null, [Validators.required]],
            birthday: [null, [Validators.required]],
            organization: [null, [Validators.required]],
            country: [null, [Validators.required]],
            province: [null, [Validators.required]],
            city: [null, [Validators.required]],
            county: [null, [Validators.required]],
            township: [null, [Validators.required]],
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
        if (control.value !== control.parent.get('password').value) {
            return {equar: true};
        }
        return null;
    }

    accountUniqueValidate(control: FormControl): Promise<any> {
        return this.http.get(server.apis.noAuth.exist, {
            params: { account: control.value }
        }).toPromise().then((res: HttpRes) => {
            if (server.successCode === res.code && res.data) {
                return { exist: res.data };
            }
            return null;
        });
    }
    // region: fields
    get account() {
        return this.form.controls.account;
    }

    get email() {
        return this.form.controls.email;
    }

    get password() {
        return this.form.controls.password;
    }

    get confirm() {
        return this.form.controls.confirm;
    }

    get name() {
        return this.form.controls.name;
    }

    get gender() {
        return this.form.controls.gender;
    }

    get birthday() {
        return this.form.controls.birthday;
    }

    get organization() {
        return this.form.controls.organization;
    }

    get country() {
        return this.form.controls.country;
    }

    get province() {
        return this.form.controls.province;
    }

    get city() {
        return this.form.controls.city;
    }

    get county() {
        return this.form.controls.county;
    }

    get township() {
        return this.form.controls.township;
    }

    // endregion

    submit() {
        this.error = '';
        this.success = '';
        for (const i in this.form.controls) {
            this.form.controls[i].markAsDirty();
        }
        if (this.form.invalid) {
            return;
        }
        this.loading = true;

        const params = {};
        for (const i in this.form.controls) {
            params[i] = this.form.controls[i].value;
        }
        params['birthday'] = moment(this.birthday.value).format('YYYY-MM-DD');

        this.http.post(server.apis.noAuth.register, params).finally(() => this.loading = false)
            .subscribe((res: HttpRes) => {
            if (server.successCode === res.code) {
                this.success = '注册成功,账号可以使用了';
            } else {
                this.error = '注册失败,请重试';
            }
        });
    }
}

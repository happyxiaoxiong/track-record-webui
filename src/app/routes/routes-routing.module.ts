import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
// dashboard pages
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
// single pages
import {AuthGuard} from "@core/guard/auth.guard";
import {Exception403Component} from "./exception/403.component";
import {Exception404Component} from "./exception/404.component";
import {Exception500Component} from "./exception/500.component";

const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: LayoutDefaultComponent,
        children: [
            { path: 'track', loadChildren: './track/track.module#TrackModule' },
            { path: 'realtime-position', loadChildren: './realtime-position/realtime-position.module#RealtimePositionModule' },
            { path: 'user', loadChildren: './user/user.module#UserModule' },
        ]
    },
    // passport
    {
        path: 'passport',
        component: LayoutPassportComponent,
        children: [
            { path: 'login', component: UserLoginComponent },
            { path: 'register', component: UserRegisterComponent },
            { path: 'register-result', component: UserRegisterResultComponent }
        ]
    },
    { path: '403', component: Exception403Component },
    { path: '404', component: Exception404Component },
    { path: '500', component: Exception500Component },
    { path: '**', redirectTo: '404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: environment.useHash })],
    exports: [RouterModule]
  })
export class RouteRoutingModule { }

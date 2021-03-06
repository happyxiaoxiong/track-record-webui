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
// single pages
import {AuthGuard} from '@core/guard/auth.guard';
import {Exception403Component} from './exception/403.component';
import {Exception404Component} from './exception/404.component';
import {Exception500Component} from './exception/500.component';
import {WelcomeComponent} from './welcome/welcome.component';

const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: LayoutDefaultComponent,
        children: [
            { path: 'track', loadChildren: './track/track.module#TrackModule' },
            { path: 'realtime-position', loadChildren: './realtime-position/realtime-position.module#RealtimePositionModule' },
            { path: 'profile', loadChildren: './profile/profile.module#ProfileModule' },
            { path: 'welcome', component: WelcomeComponent, data: { titleI18n: 'welcome' } },
            { path: '', component: WelcomeComponent, data: { titleI18n: 'welcome' } },
        ]
    },
    // passport
    {
        path: 'passport',
        component: LayoutPassportComponent,
        children: [
            { path: 'login', component: UserLoginComponent, data: { titleI18n: 'login' } },
            { path: 'register', component: UserRegisterComponent, data: { titleI18n: 'register' } }
        ]
    },
    { path: '403', component: Exception403Component, data: { title: '403' }  },
    { path: '404', component: Exception404Component, data: { title: '404' } },
    { path: '500', component: Exception500Component, data: { title: '500' } },
    { path: '**', redirectTo: '404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: environment.useHash })],
    exports: [RouterModule]
  })
export class RouteRoutingModule { }

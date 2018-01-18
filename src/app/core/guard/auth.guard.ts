import {Injectable} from '@angular/core';
import {
    CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild,
    CanLoad, Route
} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {UserService} from '@core/service/user.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(private userService: UserService, private router: Router) {
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkLogin(state.url);
    }

    canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
        return this.checkLogin(`/${route.path}`);
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        return this.canActivate(childRoute, state);
    }

    checkLogin(url: string): boolean {
        if (this.userService.isLogin()) {
            return true;
        }
        this.userService.logout(url);
        return false;
    }
}

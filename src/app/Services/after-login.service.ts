import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AfterLoginService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.auth.isLoginValid().pipe(
      map((loggedIn) => {
        if (loggedIn) {
          console.log("try to redirect to 'home' because invalide auth autorization");
          this.router.navigate(['home']);
          return false;
        }
        return true;
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { HttpRoutesService } from './http-routes.service';
import { TokenService } from './token.service';

/*
  special juste pour savoir si on est connecter ou non !
*/

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private token: TokenService,
    private router: Router,
    private httpRoutesService: HttpRoutesService
  ) { }

  ngOnDestroy(): void { }

  login(loginData: any, urlRedirection = '/home') {
    this.httpRoutesService
      .login(loginData)
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          this.token.set(data.access_token);
          let valid = this.token.isValid();
          if (valid != 1) this.logout();
          else this.router.navigateByUrl(urlRedirection);
        },
        (error) => {
          console.log(error);
          this.logout();
        }
      );
  }

  /**
   * this will logout from server side then from client side
   */
  logout() {
    if (this.token.get()) {      
      this.httpRoutesService
        .logout()
        .pipe(take(1))
        .subscribe(
          (data) => {
            this._logoutFromClientSide(data);
          },
          (error) => {
            this._logoutFromClientSide(error)
          }
        );
    }
    
    console.log('redirect');
    this.router.navigateByUrl('/login');
  }

  /**
   * this will logout from the client side without logout from the server side
   * @param data 
   */
  private _logoutFromClientSide(data) {
    console.log(data);
    //we remove the token
    this.token.remove();
    //to modify the token statut          
    this.token.isValid();
    this.router.navigateByUrl('/login');
  }

  getToken() {
    return this.token.get();
  }

  /**
   * refresh the token from server then replace the token in client side
   *
   * @returns void
   *
   *
   */
  refreshAccessToken(): Observable<any> {
    if (this.token.get()) {
      this.refreshTokenServer()
        .pipe(take(1))
        .subscribe(
          (data: any) => {
            //we check the validity of the token in the refreshtokenclient
            this.token.set(data.access_token);
            let valid = this.token.isValid();
            if (valid != 1) this.logout();
          },
          (err) => {
            console.log(err);
            this.logout();
          }
        );
    } else this.logout();

    //return Result Of Refresh As an Observable
    let tokenAsObservable = new Observable((Subscriber) => {
      if (this.token.isTokenValid()) Subscriber.next(this.token.get());
      else Subscriber.error('refresh token problem.');
    });
    return tokenAsObservable;
  }

  /**
   * refresh the token from server
   *
   * @returns void
   *
   *
   */
  private refreshTokenServer() {
    return this.httpRoutesService.refreshToken();
  }

  /**
   * just return the token last status as observable without revirefication
   * @returns 
   */
  isLoggedInAsObservable() {
    return this.token.isTokenValidAsObservable();
  }

  /**
   * just return the token last status as boolean without revirefication
   * @returns 
   */
  isLoggedIn() {
    return this.token.isTokenValid();
  }

}

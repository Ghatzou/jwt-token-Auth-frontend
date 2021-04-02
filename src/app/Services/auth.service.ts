import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { HttpRoutesService } from './http-routes.service';
import { TokenService } from './token.service';

/*
  special juste pour savoir si on est connecter ou non !
*/

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * only call this in token interceptor
   * used to know if the refresh token from server is in progress or not
   */
  public refreshTokenInProgress = false;
  // Refresh Token Subject tracks the current token, or is null if no token is currently
  // available (e.g. refresh pending).
  /**
   * only call this in token interceptor
   * used to know if the refresh token from server is in progress or not
   */
  public refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private token: TokenService,
    private router: Router,
    private httpRoutesService: HttpRoutesService
  ) {}

  ngOnDestroy(): void {}

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
          console.log('login error : ', error);
          this.logout();
        }
      );
  }

  /**
   * this will logout from server side then from client side
   */
  logout() {
    console.log('will logout ...');
    if (this.token.get()) {
      this.httpRoutesService
        .logout()
        .pipe(take(1))
        .subscribe(
          (data) => {
            this._logoutFromClientSide(data);
          },
          (error) => {
            this._logoutFromClientSide(error);
          }
        );
    }
    this.router.navigateByUrl('/login');
  }

  /**
   * this will logout from the client side without logout from the server side
   * @param data
   */
  private _logoutFromClientSide(data) {
    console.log('logout from client side, logout message : ', data);
    //we remove the token
    this.token.remove();
    //to modify the token statut
    this.token.isValid();
  }

  getToken() {
    return this.token.get();
  }

  /**
   * refresh the token from server then replace the token in client side
   *
   * @returns Observable<any>
   *
   *
   */
  refreshAccessToken(): Observable<any> {
    console.log('try to refresh token from server side ...');

    this.refreshTokenInProgress = true;
    // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
    this.refreshTokenSubject.next(null);

    return new Observable((obs) => {
      if (this.token.get()) {
        this.refreshTokenServer()
          .pipe(take(1))
          .subscribe(
            (data: any) => {
              console.log('token successfuly refreshed, more details : ', data);
              //When the call to refreshToken completes we reset the refreshTokenInProgress to false
              //for the next time the token needs to be refreshed
              this.refreshTokenInProgress = false;
              this.refreshTokenSubject.next(this.token.get());
              //we check the validity of the token in the refreshtokenclient
              this.token.set(data.access_token);
              let valid = this.token.isValid();
              if (valid !== 1) {
                this.logout();
                obs.error('refresh token problem.');
                this.refreshTokenInProgress = false;
                this.refreshTokenSubject.error('refresh token problem.');
              } else {
                obs.next(this.token.get());
              }
            },
            (err) => {
              console.log('refresh token problem. ');
              this.logout();
              obs.error(err);
              this.refreshTokenInProgress = false;
              this.refreshTokenSubject.error(err);
            }
          );
      } else {
        this.logout();
        obs.error('no token to be refreshed !');
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.error('no token to be refreshed !');
      }
    });
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

  /**
   * verify and refresh the token status before return it's status as an observable
   * check connexion with server and if possible trigger refresh token in server side if token in the client side expired
   * logout if token invalid (iss issue or not exist)
   * @returns Observable<boolean> : true if token valid, false if not
   */
  isLoginValid() {
    console.log('will check for authValidation ...');

    let valid = this.token.isValid();

    if (valid == 0) {
      console.log(
        'authValidation::token invalid [expired time], check connexion with server ...'
      );
      return new Observable<boolean>((obs) => {
        this._ping()
          .pipe(take(1))
          .subscribe((requestSucced: boolean) => {
            if (requestSucced) {
              //in this case this can't happen
              console.log(
                'connexion with server pass with no problem ! (this cant happend because we just verify that the token is expired and we doesnt refresh it yet, so how does this ping connexion pass !)'
              );
              console.log('exptected error : 401 statut, unauthorized access.');
              obs.next(true);
            } else {
              //100% this occures
              console.log(
                'connexion with server cant be done !, this is normal because the token need to be refreshed.'
              );
              //if the refresh token is not in progress
              if (!this.refreshTokenInProgress) {
                //we return the token status
                obs.next(this.token.isTokenValid());
              }
              //if the refresh token is in progress
              else {
                this.refreshTokenSubject
                  .pipe(
                    filter((result: any) => result !== null),
                    take(1),
                    catchError((err) => throwError(err))
                  )
                  .subscribe(
                    (data) => {
                      console.log(
                        'refresh token process finish with success, more informations : ',
                        data
                      );
                      obs.next(this.token.isTokenValid());
                    },
                    (err) => {
                      console.log(
                        'refresh token process finish with failure, more informations : ',
                        err
                      );
                      obs.next(this.token.isTokenValid());
                    }
                  );
              }
            }
          });
      });
    } else {
      if (valid == -1)
        console.log(
          'authValidation::token invalid [iss or not set] , no need to refresh'
        );
      else console.log('authValidation::token valid , no need to refresh');
      return this.token.isTokenValidAsObservable();
    }
  }

  /**
   * this method just test connexion with the server
   * it can be useful for refreshing the token in case it's expired
   * @returns Observable<boolean> : wich containe
   *                                  • true if connexion pass with success,
   *                                  • false if there is an error (authentification or other)
   */
  private _ping() {
    console.log(
      'check connexion with server [expired time], will refresh from server ...'
    );
    return new Observable<boolean>((obs) => {
      this.httpRoutesService
        .ping()
        .pipe(take(1))
        .subscribe(
          (data) => {
            console.log(
              'connexion pass, and no error occurs, more informations -> ',
              data
            );
            obs.next(true);
          },
          (err) => {
            console.log(
              'connexion errors (can be 401 error or others), more informations -> ',
              err
            );
            obs.next(false);
          }
        );
    });
  }
}

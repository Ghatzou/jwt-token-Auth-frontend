import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
  private refreshTokenInProgress = false;
  // Refresh Token Subject tracks the current token, or is null if no token is currently
  // available (e.g. refresh pending).
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private auth: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    return next.handle(this.addToken(request)).pipe(
      catchError((error) => {
        //if err is an httperror response
        if (error instanceof HttpErrorResponse) {
          //we don't want to refresh token if there is no token set !
          if(this.auth.getToken() == null) {
            console.log('here we throw error unstead of trying to refresh the token for this request :');
            console.log(request);
            return throwError(error);
          }
          // We don't want to refresh token for some requests like login or refresh token itself
          // So we verify url and we throw an error if it's the case
          if (
            request.url.includes('refresh') ||
            request.url.includes('login') 
          ) {
            // We do another check to see if refresh token failed
            // In this case we want to logout user and to redirect it to login page

            if (request.url.includes('refresh')) {
              this.auth.logout();
            }

            return throwError(error);
          }

          // If error status is different than 401 we want to skip refresh token
          // So we check that and throw the error if it's the case
          if (error.status !== 401) {
            return throwError(error);
          }
          if (this.refreshTokenInProgress) {
            // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
            // – which means the new token is ready and we can retry the request again
            return this.refreshTokenSubject.pipe(
              filter((result: any) => result !== null),
              take(1),
              switchMap(() => next.handle(request))
            );
          } else {
            this.refreshTokenInProgress = true;

            // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
            this.refreshTokenSubject.next(null);

            // Call auth.refreshAccessToken(this is an Observable that will be returned)
            //TODO: remove the creation of inutil observable !
            return new Observable((Subscriber) =>
              Subscriber.next(this.auth.refreshAccessToken())
            ).pipe(
              take(1),
              switchMap((token: any) => {
                //When the call to refreshToken completes we reset the refreshTokenInProgress to false
                //for the next time the token needs to be refreshed
                this.refreshTokenInProgress = false;
                this.refreshTokenSubject.next(token);
                console.log(`token refreshed : `);                

                return next.handle(request);
              }),
              catchError((err: any) => {
                this.refreshTokenInProgress = false;
                return throwError(err);
              })
            );
          }
        }
        //if err is not an httperror response
        return new Observable<HttpEvent<any>>();
      })
    );
  }

  private addToken(request: HttpRequest<any>) {
    // Get access token from Local Storage
    const accessToken = this.auth.getToken();

    // If access token is null this means that user is not logged in
    // And we return the original request
    if (!accessToken) {
      return request;
    }

    // We clone the request, because the original request is immutable
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`,
      },
    });
  }
}

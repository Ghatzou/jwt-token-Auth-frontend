import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private iss = {
    login: 'http://repos.local:8000/api/auth/login',
    register: 'http://repos.local:8000/api/auth/register',
  };

  //valid token set to false when starting the app
  //this will change his value at the first test of login (authGuard:CanActivate)
  private _tokenInitialState: boolean = false;
  private _validTokenSubject = new BehaviorSubject<boolean>(
    this._tokenInitialState
  );
  private _validTokenSubscription: Subscription = null;
  public validToken = this._tokenInitialState;

  constructor() {
    this._validTokenSubscription = this._validTokenSubject.subscribe(
      (next: boolean) => {
        this.validToken = next;
        console.log(this.validToken);
      }
    );
  }

  ngOnDestroy() {
    if (this._validTokenSubscription)
      this._validTokenSubscription.unsubscribe();
  }

  set(token) {
    localStorage.setItem('token', token);
  }

  get(): string {
    return localStorage.getItem('token');
  }

  remove() {
    localStorage.removeItem('token');
  }

  /**
   * test if the token is valid and change the token status
   * test iss and exp in client side
   *
   * @returns -1 if token invalid and can't be refreshed
   * @returns 0 if token invalid (token expired time)
   * @returns 1 if token is valid
   */
  isValid(): -1 | 0 | 1 {
    const token = this.get();
    let state: -1 | 0 | 1 = -1;
    //if token exist
    if (token) {
      const payload = this.getPayload(token);
      //if payload exist
      if (payload) {
        const isTokenValidSource = this.tokenValideSource(payload);
        const isTokenExpired = this.tokenExpired(payload);
        if (isTokenValidSource && !isTokenExpired) {
          state = 1;
        } else if (isTokenExpired) {
          state = 0;
        }
      } else state = -1;
    } else state = -1;

    if (state == 1) {
      this.changeTokenStatut(true);
    } else {
      // (state === -1 || state === 0)
      this.changeTokenStatut(false);
    }
    return state;
  }

  //to know if the token is valid
  isTokenValidAsObservable(): Observable<boolean> {
    return this._validTokenSubject.asObservable();
  }

  /**
   * 
   * @returns the token status
   */
  isTokenValid(): boolean {
    return this.validToken;
  }

  private tokenValideSource(payload) {
    if (Object.values(this.iss).indexOf(payload.iss) > -1) {
      return true;
    }
  }

  private tokenExpired(payload) {
    const expiry = payload.exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  getPayload(token) {
    let tokenSplited = token.split('.');
    let payload = null;
    if (tokenSplited.length > 1) {
      const codedPayload = token.split('.')[1];
      payload = this.decodePayload(codedPayload);
    }
    return payload;
  }

  decodePayload(payload) {
    return JSON.parse(atob(payload));
  }

  /**
   * don't need to change this manualy
   * just call token.isValid and the token status will be changed automaticaly
   * 
   * @param val 
   * @returns 
   */
  private changeTokenStatut(val: boolean): void {
    //only change token statut when we have a different statut
    if (val == this.validToken) return;
    this._validTokenSubject.next(val);
  }
}

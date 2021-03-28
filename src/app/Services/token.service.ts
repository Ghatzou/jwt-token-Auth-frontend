import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private iss = {
    login : 'http://repos.local:8000/api/auth/login',
    register : 'http://repos.local:8000/api/auth/register'
  }
  constructor() { }

  handle(token) {
    this.set(token);
    return this.isValid();
  }

  set(token) {
    localStorage.setItem('token', token);
  }

  get() {
    return localStorage.getItem('token');
  }

  remove() {
    localStorage.removeItem('token');
  }

  isValid() {
    const token = this.get();
    //if token exist
    if (token) {
      const payload = this.getPayload(token);
      //if payload exist
      if (payload) {
        return Object.values(this.iss).indexOf(payload.iss) > -1 ? true : false;
      }
      //payload issue
      return false;
    }
    //token does not exist
    return false;
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

  loggedIn(): boolean {
    return this.isValid();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.token.loggedIn());
  public authStatus = this.loggedIn.asObservable();

  constructor(private token: TokenService) { }

  changeAuthStatus(value: boolean) {
    this.loggedIn.next(value);
  }
}

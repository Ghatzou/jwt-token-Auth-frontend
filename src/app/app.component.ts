import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'RePos-frontend';

  public loggedIn: boolean;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.auth.authStatus.subscribe(value => this.loggedIn = value);
  }

  logout(e) {
    e.preventDefault();
    this.auth.changeAuthStatus(false);
    this.router.navigateByUrl('/home');
  }
}

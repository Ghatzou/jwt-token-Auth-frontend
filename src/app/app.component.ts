import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'RePos-frontend';

  public loggedIn: boolean;
  private isLoggedInSubscription: Subscription = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.isLoggedInSubscription = this.auth
      .isLoggedInAsObservable()
      .subscribe((value) => (this.loggedIn = value));
  }

  ngOnDestroy(): void {
    if (this.isLoggedInSubscription) this.isLoggedInSubscription.unsubscribe();
  }

  logout(e) {
    e.preventDefault();
    this.auth.logout();
  }
}

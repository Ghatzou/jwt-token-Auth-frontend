import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { HttpRoutesService } from 'src/app/Services/http-routes.service';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  //variable declaration
  public form = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
    password_confirmation: null,
  };

  public error: any = [];
  private RegisterSubmitSubscription : Subscription = null;

  //methodes
  constructor(
    private httpRoutesService: HttpRoutesService,
    private auth: AuthService,
    private router: Router
  ) {
    //
  }

  ngOnInit(): void {}

  onSubmit() {
    this.RegisterSubmitSubscription = this.httpRoutesService.register(this.form).subscribe(
      (data) => this.handleResponse(data),
      (error) => {
        this.error = error.error.errors;
        console.log(this.error);
      }
    );
  }

  handleResponse(data) {
    //tmp solution
    this.router.navigate(['home']);
    //i don't know what i should do here, when i cam to registration i will change it
    // this.auth.login(data.access_token);
    // this.auth.isLoggedInAsObservable().pipe(
    //   map((loggedIn) => {
    //     if (loggedIn) {
    //       this.router.navigate(['home']);
    //     }
    //   })
    // );
  }
}

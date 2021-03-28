import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRoutesService } from 'src/app/Services/http-routes.service';
import { TokenService } from 'src/app/Services/token.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  //variable declaration 
  public form = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
    password_confirmation: null
  };

  public error: any = [];

  //methodes
  constructor(
    private httpRoutesService: HttpRoutesService,
    private token: TokenService,
    private router: Router
  ) {
    //
  }

  ngOnInit(): void {
  }

  onSubmit() {
    return this.httpRoutesService.register(this.form).subscribe(
      data => this.handleResponse(data),
      (error) => {
        this.error = error.error.errors;
        console.log(this.error);
      }
    );
  }

  handleResponse(data) {
    if (this.token.handle(data.access_token)) {
      this.router.navigateByUrl('/home')
    }
  }

}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

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

  public error : any = [];

  //methodes
  constructor(private http: HttpClient) {
    //
  }

  ngOnInit(): void {
  }

  onSubmit() {
    return this.http.post('http://repos.local:8000/api/auth/register',
      this.form).subscribe(
        data => console.log(data),
        (error) => {
          this.error = error.error.errors;
          console.log(this.error);
        }
      );
  }

}

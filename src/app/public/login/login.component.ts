import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //variable declaration 
  public form = {
    email:null,
    password:null
  };

  //methodes
  constructor(private http:HttpClient) { 
    //
  }

  ngOnInit(): void {
  }

  onSubmit() {
    return this.http.post('http://repos.local:8000/api/auth/login',
    this.form).subscribe(
     data => console.log(data),
     error => console.log(error)
   );
  }

}

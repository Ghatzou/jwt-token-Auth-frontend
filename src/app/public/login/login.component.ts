import { Component, OnInit } from '@angular/core';
import { HttpRoutesService } from 'src/app/Services/http-routes.service';
import { TokenService } from 'src/app/Services/token.service';

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
  constructor(
    private httpRoutesService: HttpRoutesService,
    private token: TokenService
  ){ 
    //
  }

  ngOnInit(): void {
  }

  onSubmit() {
    return this.httpRoutesService.login(this.form).subscribe(
     data => this.handleResponse(data),
     error => console.log(error)
   );
  }

  handleResponse(data) {
    this.token.handle(data.access_token);
  }

}

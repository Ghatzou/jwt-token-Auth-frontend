import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
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
    private token: TokenService,
    private router: Router,
    private auth: AuthService
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
    let isValidToken = this.token.handle(data.access_token);
    if(isValidToken) {
      this.auth.changeAuthStatus(true);
      this.router.navigateByUrl('/home');
    }
  }

}

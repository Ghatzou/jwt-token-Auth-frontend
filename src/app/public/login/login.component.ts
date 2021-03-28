import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HttpRoutesService } from 'src/app/Services/http-routes.service';

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
  constructor(private httpRoutesService: HttpRoutesService) { 
    //
  }

  ngOnInit(): void {
  }

  onSubmit() {
    return this.httpRoutesService.login(this.form).subscribe(
     data => console.log(data),
     error => console.log(error)
   );
  }

}

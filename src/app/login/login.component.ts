import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  //variable declaration
  public form = {
    email: null,
    password: null,
  };

  //methodes
  constructor(
    private auth: AuthService
  ) {
    //
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {  }

  onSubmit() {
    this.auth.login(this.form);
  }
}

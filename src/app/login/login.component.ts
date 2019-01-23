import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm:FormGroup;
  email:string;
  password:string;

  displayMessage:boolean;
  displayErrorMessage:boolean;
  validationMessage = [];
  errorMessage = [];
  errorLink:string;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    public auth: AuthService,
    private cookieService: CookieService,
    private logger: NGXLogger
  ) {
    router.events.subscribe((val) => {
        // document.body.style.background = 'rgb(54, 73, 78, 1)';
        document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.height = '100%';
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      'email': [this.email, [Validators.required, Validators.email]],
      'password': [this.password, [Validators.required]],
    });
  }

  onSubmit() {
    // validate form
    // console.log(this.loginForm.value);
    var validated = this.validateLoginForm(this.loginForm);

    //if valid, attempt to login
    if (validated.status) {
      // attempt to login
      this.auth.login(
        this.loginForm.get('email').value,
        this.loginForm.get('password').value
      ).subscribe(data => {
        console.log("DATA:", data);
        // navigate to profile url based on their id
        this.router.navigateByUrl('/manage/' + data.id.toString());
      }, error => {
        console.log("ERROR:", error);
        this.errorMessage = [];
        if(error.status === 404) {
          this.displayErrorMessage = true;
          this.displayMessage = false;
          this.errorMessage.push(error.error.message);
          this.errorLink = 'signup';
        } else if(error.status === 401) {
          this.displayErrorMessage = true;
          this.displayMessage = false;
          this.errorMessage.push('Incorrect login information.');
          // eventually when forgot password is implemented, add link here
        } else {
          this.displayErrorMessage = true;
          this.displayMessage = false;
          this.errorMessage.push('Unable to process your request.');
        }
      });
    } else {
      // display message
      this.displayMessage = true;
      this.displayErrorMessage = false;
      this.validationMessage = validated.message;
    }
  }

  validateLoginForm(l:FormGroup) {
    // variables to return
    let messageList: Array<string> = [];
    let status: boolean = true;

    // check if the email is invalid
    if (l.get('email').invalid) {
      status = false;
      messageList.push('Email invalid.');
    }

    // check if password is invalid
    if (l.get('password').invalid) {
      status = false;
      messageList.push('Password invalid.');
    }

    // return object
    return { status: status, message: messageList };
  }
}

import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NGXLogger } from 'ngx-logger';

// icons
import { faLayerGroup, faUserTie, faSmileBeam } from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Credentials': 'true'
  }),
  // withCredentials: true,
  // credentials: 'include'
};

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  faLayerGroup = faLayerGroup;
  faUserTie = faUserTie;
  faSmileBeam = faSmileBeam;

  // public innerWidth: any;
  // public innerHeight: any;
  public triangle: any;

  public title: string;
  // private signupSubmitted: boolean;
  private submitSuccess: boolean;

  signupForm:FormGroup;
  email:string;
  password:string;
  repassword:string;
  firstname:string;
  lastname:string;

  displayMessage:boolean;
  validationMessage:string[];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private logger: NGXLogger
  ) {

    router.events.subscribe((val) => {
      // document.body.style.background = '#393E41';
      document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
      document.body.style.backgroundSize = 'cover';
      document.body.style.height = '100%';
      // this.logger.debug(val instanceof NavigationEnd);
    });
  }

  ngOnInit() {
    this.signupForm = this.fb.group({
      'email': [this.email, [Validators.required, Validators.email]],
      'password': [this.password, [Validators.required, Validators.minLength(7)]],
      'rePassword': [this.repassword, [Validators.required]],
      'firstName': [this.firstname, [Validators.required]],
      'lastName': [this.lastname, [Validators.required]]
    });
  }

  onSubmit() {
    // this.logger.debug(this.signupForm.value);

    // validate form
    var validated = this.validateSignUpForm(this.signupForm);
    this.logger.debug(validated);
    // if valid, attempt to signup
    if (validated.status) {
      // this.logger.debug(this.signupForm.get('email').value);
      // attempt to sign up
      this.signUp(this.signupForm.get('email').value, this.signupForm.get('password').value, this.signupForm.get('firstName').value, this.signupForm.get('lastName').value);
    } else {
      // display message
      this.displayMessage = true;
      this.validationMessage = validated.message;
    }
  }

  // listen to the width and height of the screen being resized
  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.innerWidth = window.innerWidth;
  //   this.innerHeight = window.innerHeight;
  // }

  private validateSignUpForm(s:FormGroup) {
    // variables to return
    let messageList: Array<string> = [];
    let status: boolean = true;

    // check if the email is invalid
    if (s.get('email').invalid) {
      status = false;
      messageList.push('Email invalid.');
    }
    // check if password is invalid
    // or if passwords do not match
    if (s.get('password').invalid) {
      status = false;
      messageList.push('Password invalid.');
    } else if (s.get('password').value !== s.get('rePassword').value) {
      status = false;
      messageList.push('Passwords do not match.');
    }
    // check if the first name field is valid
    if (s.get('firstName').invalid) {
      status = false;
      messageList.push('First name invalid.');
    }
    // check if the last name field is valid
    if (s.get('lastName').invalid) {
      status = false;
      messageList.push('Last name invalid.');
    }

    // return object
    return { status: status, message: messageList };
  }

  private signUp(email:string, password:string, firstname:string, lastname:string) {
    this.logger.debug(API_URL + '/api/signup');
    // call api
    this.http.post<SignUpResponse>(
      API_URL + '/api/signup',
      {
        'email': email,
        'password': password,
        'firstname': firstname,
        'lastname': lastname
      },
      httpOptions
    )
      .subscribe(data => {
        this.logger.debug(data);
        this.logger.debug('/manage/' + data.data.user_id.toString());
        this.router.navigateByUrl('/manage/' + data.data.user_id.toString());
      });
  }
}

export interface SignUpResponse {
  message: string,
  data: {
    user_id: string,
    firstname: string,
    lastname: string
  }
}

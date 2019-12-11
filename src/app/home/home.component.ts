import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

// icons
import { faLayerGroup, faUserTie, faSmileBeam } from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

// url for the jobtrakr api
const API_URL = environment.apiUrl;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  // font awesome icons
  faLayerGroup = faLayerGroup;
  faUserTie = faUserTie;
  faSmileBeam = faSmileBeam;

  // public innerWidth: any;
  // public innerHeight: any;
  public triangle: any;

  public title: string;
  // private signupSubmitted: boolean;
  private submitSuccess: boolean;

  // form variables
  signupForm:FormGroup;
  email:string;
  password:string;
  repassword:string;
  firstname:string;
  lastname:string;

  // error messages
  displayMessage:boolean;
  validationMessage:string[];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {

    router.events.subscribe((val) => {
      document.body.style.background = '#FFFFFF';
      document.body.style.backgroundSize = 'cover';
      document.body.style.webkitBackgroundSize = 'cover';
      document.body.style.height = '100%';
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

  ngAfterViewInit() {
    document.querySelector('body').classList.add('image-background');
  }

  ngOnDestroy() {
    document.querySelector('body').classList.remove('image-background');
  }

  onSubmit() {
    // validate form
    var validated = this.validateSignUpForm(this.signupForm);
    console.log(validated);
    // if valid, attempt to signup
    if (validated.status) {
      // attempt to sign up
      this.signUp(this.signupForm.get('email').value, this.signupForm.get('password').value, this.signupForm.get('firstName').value, this.signupForm.get('lastName').value);
    } else {
      // display message
      this.displayMessage = true;
      this.validationMessage = validated.message;
    }
  }

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

  // function to call the jobtrakr api to create a new user
  private signUp(email:string, password:string, firstname:string, lastname:string) {
    console.log(API_URL + '/api/signup');
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
        console.log(data);
        console.log('/manage/' + data.data.user_id.toString());
        this.router.navigateByUrl('/manage/' + data.data.user_id.toString());
      });
  }
}

// interface for the response we expect to get back
export interface SignUpResponse {
  message: string,
  data: {
    user_id: string,
    firstname: string,
    lastname: string
  }
}

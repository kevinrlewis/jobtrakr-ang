import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public innerWidth: any;
  public innerHeight: any;
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

  attempt:signupObject;

  displayMessage:boolean;
  validationMessage:string[];

  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient) {

    router.events.subscribe((val) => {
        // document.body.style.background = '#393E41';
        document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.height = '100%';
        console.log(val instanceof NavigationEnd);
    });
  }

  ngOnInit() {
    this.signupForm = this.fb.group({
        'email': [this.email, Validators.required],
        'password': [this.password, Validators.required],
        'rePassword': [this.repassword, Validators.required],
        'firstName': [this.firstname, Validators.required],
        'lastName': [this.lastname, Validators.required]
    })
  }

  onSubmit() {
    // console.log(this.signupForm.value);

    // validate form
    var validated = this.validateSignUpForm(this.signupForm);
    console.log(validated);
    // if valid, attempt to signup
    if (validated.status) {
      // attempt to sign up
    } else {
      // display message
      this.displayMessage = true;
      this.validationMessage = validated.message;
      console.log(validated.message);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    // if(this.innerWidth > 576) {
    //   document.getElementById('triangle-img').style.clipPath = 'polygon(0% 0%, 0% 100%, ' + (this.innerWidth/18) + '% 50%)'
    // } else {
    //
    // }
  }

  validateSignUpForm(s:FormGroup) {
    console.log(s);
    let messageList: Array<string> = [];
    let status: boolean = true;
    if (s.get('email').invalid) {
      status = false;
      messageList.push('Email invalid.');
    }
    if (s.get('password').invalid) {
      console.log('checking password....');
      status = false;
      messageList.push('Password invalid.');
    }
    if (s.get('password').value !== s.get('rePassword').value) {
      status = false;
      messageList.push('Passwords do not match.');
    }
    if (s.get('firstName').invalid) {
      status = false;
      messageList.push('First name invalid.');
    }
    if (s.get('lastName').invalid) {
      status = false;
      messageList.push('Last name invalid.');
    }
    console.log(messageList);

    return { status: status, message: messageList };

    // this.displayMessage = false;
    // this.validationMessage = "";
    // console.log(s);
    // // check for nulls
    // if((s.email === null || s.email === "") || (s.password === null || s.password === "") || (s.repassword === null || s.repassword === "") || (s.firstname === null || s.firstname === "") || (s.lastname === null || s.lastname === "")) {
    //   return {
    //     status: false,
    //     message: "Required fields missing."
    //   };
    // } else if (s.password != s.repassword) {
    //   return {
    //     status: false,
    //     message: "Passwords do not match."
    //   };
    // }
  }
}

export interface signupObject {
  email: string,
  password: string,
  repassword: string,
  firstname: string,
  lastname: string
}

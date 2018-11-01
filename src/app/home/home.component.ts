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


  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient) {
    this.signupSubmitted = false;

    router.events.subscribe((val) => {
        // see also
        // document.body.style.background = '#393E41';
        document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.height = '100%';
        console.log(val instanceof NavigationEnd);
    });
  }

  ngOnInit() {
    // if(window.innerWidth > 576) {
    //   document.getElementById('triangle').style.borderLeft = String(window.innerWidth/25) + 'em solid green';
    //   document.getElementById('triangle').style.borderTop = '20em solid transparent';
    //   document.getElementById('triangle2').style.borderBottom = '20em solid transparent';
    // } else {
    //   document.getElementById('triangle').style.borderLeft = String(window.innerWidth/32) + 'em solid transparent';
    //   document.getElementById('triangle').style.borderRight = String(window.innerWidth/32) + 'em solid transparent';
    //   document.getElementById('triangle').style.borderTop = String(window.innerWidth/75) + 'em solid green';
    //
    //   document.getElementById('triangle2').style.borderLeft = String(window.innerWidth/32) + 'em solid transparent';
    //   document.getElementById('triangle2').style.borderRight = String(window.innerWidth/32) + 'em solid transparent';
    //   document.getElementById('triangle2').style.borderBottom = String(window.innerWidth/75) + 'em solid green';
    // }

    // this.signupForm = this.fb.group({
    //   email: [this.email, Validators.required],
    //   password: [this.password, Validators.required, Validators.minLength(7)],
    //   rePassword: [this.repassword, Validators.required, Validators.minLength(7)],
    //   firstName: [this.firstname, Validators.required],
    //   lastName: [this.lastname, Validators.required]
    // });
    this.signupForm = this.fb.group({
        'email': [this.email, Validators.required],
        'password': [this.password, Validators.required],
        'rePassword': [this.repassword, Validators.required],
        'firstName': [this.firstname, Validators.required],
        'lastName': [this.lastname, Validators.required]
    })
  }

  onSubmit() {
    console.log(this.signupForm.value);

    // validate form

    // attempt to sign up

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
}

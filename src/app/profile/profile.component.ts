import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Credentials': 'true'
  }),
  // withCredentials: true,
  // credentials: 'include'
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // @Input() email: string;
  id: string;
  email: string;
  firstname: string;
  lastname: string;

  opportunities_active: boolean;
  phone_screens_active: boolean;
  interviews_active: boolean;
  offers_active: boolean;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    router.events.subscribe((val) => {
        // document.body.style.background = 'rgb(54, 73, 78, 1)';
        // document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
        // document.body.style.backgroundSize = 'cover';
        // document.body.style.height = '100%';
    });
  }

  ngOnInit() {
    const token = this.cookieService.get('SESSIONID');
    // console.log("cookies: ", this.cookieService.getAll());

    this.setInitVariables();

    this.id = jwt_decode(token).sub.toString();

    this.http.get<GetUserResponse>(
      '/api/user/id/' + this.id,
      httpOptions
    ).subscribe(data => {
      console.log(data);

      this.email = data.data.email;
      this.firstname = data.data.firstname;
      this.lastname = data.data.lastname
    });
  }

  setInitVariables() {
    this.opportunities_active = false;
    this.phone_screens_active = false;
    this.interviews_active = false;
    this.offers_active = false;
  }

  toggleOpportunitiesActive() {
    this.opportunities_active = !this.opportunities_active;
    console.log('opportunities_active: ', this.opportunities_active);
  }

  togglePhoneScreensActive() {
    this.phone_screens_active = !this.phone_screens_active;
  }

  isSubComponentActive() {
    return (this.opportunities_active || this.phone_screens_active || this.interviews_active || this.offers_active);
  }

}

interface GetUserResponse {
  message: string,
  data: {
    user_id: number,
    email: string,
    firstname: string,
    lastname: string
  }
}

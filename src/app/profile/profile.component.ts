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

  token: string;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    this.id = this.email = this.firstname = this.lastname = "";

    router.events.subscribe((val) => {
        // document.body.style.background = 'rgb(54, 73, 78, 1)';
        // document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
        // document.body.style.backgroundSize = 'cover';
        // document.body.style.height = '100%';
    });
  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
    // console.log("cookies: ", this.cookieService.getAll());

    this.id = jwt_decode(this.token).sub.toString();

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

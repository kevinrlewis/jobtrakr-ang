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

// const imgPath = './../../../.profile_images/default_profile.png';
const imgPath = './../../assets/.profile_images/default_profile.png';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // @Input() email: string;
  sharingForm: FormGroup;
  editForm: FormGroup;

  id: string;
  email: string;
  firstname: string;
  lastname: string;
  share_opportunies: boolean;
  share_applied: boolean;
  share_interviews: boolean;
  share_offers: boolean;
  profile_image: string;
  bio: string;
  create_datetime: string;
  update_datetime: string;

  token: string;

  constructor(private http: HttpClient, private fb: FormBuilder, private cookieService: CookieService, private router: Router) {
    this.id = this.email = this.firstname = this.lastname = this.profile_image = this.bio = this.create_datetime = this.update_datetime = "";

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

    console.log('share_opportunities:', this.share_opportunies);
    // set values retrieved from user
    this.sharingForm = this.fb.group({
      'shareOpportunities': [this.share_opportunies, []],
      'shareApplied': [this.share_applied, []],
      'shareInterviews': [this.share_interviews, []],
      'shareOffers': [this.share_offers, []],
    });

    this.editForm = this.fb.group({
      'firstName': [this.firstname, []],
      'lastName': [this.lastname, []],
      'email': [this.email, []],
      'profileImage': [this.profile_image, []],
      'bio': [this.bio, []],
    });

    this.http.get<GetUserResponse>(
      '/api/user/id/' + this.id,
      httpOptions
    ).subscribe(data => {
      console.log(data);

      // initialize values retrieved from db
      this.email = data.data.email;
      this.firstname = data.data.firstname;
      this.lastname = data.data.lastname;
      this.share_opportunies = data.data.share_opportunities;
      this.share_applied = data.data.share_applied;
      this.share_interviews = data.data.share_interviews;
      this.share_offers = data.data.share_offers;
      this.profile_image = (data.data.profile_image === null) ? imgPath : data.data.profile_image;
      this.bio = data.data.bio;
      this.create_datetime = data.data.create_datetime;
      this.update_datetime = data.data.update_datetime;

      this.sharingForm.get('shareOpportunities').setValue(this.share_opportunies);
      this.sharingForm.get('shareApplied').setValue(this.share_applied);
      this.sharingForm.get('shareInterviews').setValue(this.share_interviews);
      this.sharingForm.get('shareOffers').setValue(this.share_offers);
    });
  }
}

interface GetUserResponse {
  message: string,
  data: {
    user_id: number,
    email: string,
    firstname: string,
    lastname: string,
    share_opportunities: boolean,
    share_applied: boolean,
    share_interviews: boolean,
    share_offers: boolean,
    profile_image: string,
    bio: string,
    create_datetime: string,
    update_datetime: string
  }
}

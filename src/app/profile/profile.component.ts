import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Job } from './../../models/job.model';
import { User } from './../../models/user.model';
import { File } from './../../models/file.model';

import { ManageService } from './../manage.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Credentials': 'true'
  }),
  // withCredentials: true,
  // credentials: 'include'
};

const API_URL = environment.apiUrl;

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

  user_id: number;
  user: User = {} as any;
  defaultProfileImageKey = "default_profile_image.png"
  signedProfileImageUrl = "";

  token: string;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService
  ) {
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
    this.user_id = jwt_decode(this.token).sub.toString();

    // set values retrieved from user
    this.sharingForm = this.fb.group({
      'shareOpportunities': [this.user.share_opportunities, []],
      'shareApplied': [this.user.share_applied, []],
      'shareInterviews': [this.user.share_interviews, []],
      'shareOffers': [this.user.share_offers, []],
    });

    // set values retrieved from user
    this.editForm = this.fb.group({
      'firstName': [this.user.first_name, []],
      'lastName': [this.user.last_name, []],
      'email': [this.user.email, []],
      // 'profileImage': [this.user.profile_image_file_id, []],
      'bio': [this.user.bio, []],
    });

    // get user data
    this.manage.getUser(this.user_id).subscribe(data => {
      console.log(data);

      // set this component's user to the data returned
      this.user = data.data;

      // set check box values
      this.sharingForm.get('shareOpportunities').setValue(this.user.share_opportunities);
      this.sharingForm.get('shareApplied').setValue(this.user.share_applied);
      this.sharingForm.get('shareInterviews').setValue(this.user.share_interviews);
      this.sharingForm.get('shareOffers').setValue(this.user.share_offers);

      // update the profile image src url with a signed s3 url
      if(this.user.profile_image_file_id === null) {
        this.signedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
      } else {
        this.signedProfileImageUrl = this.manage.getAttachment(this.user.profile_image_file_id.file_name);
      }
    });
  }

  onSharingSubmit() {
    console.log(this.sharingForm.value);
    this.manage.updateUserSharing(this.user_id, this.sharingForm.value)
      .subscribe(data => {
        // display validations that the values were updated
        console.log(data);
        this.user = data.data.update_user_sharing;
      }, error => {
        console.log(error);
        // handle errors
      });
  }

  onEditProfileSubmit() {
    console.log(this.editForm);
  }

  onFileChange(event) {
    console.log(event);
    // save profile image to database and assign the user to it
    this.manage.saveProfileImage(event, this.user_id)
      .subscribe(data => {
        console.log(data);
        // update the current profile image src url
        this.signedProfileImageUrl = this.manage.getAttachment(data.file);
      });
  }
}

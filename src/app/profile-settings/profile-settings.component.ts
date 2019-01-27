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
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {

  // @Input() email: string;
  sharingForm: FormGroup;
  editForm: FormGroup;

  user_id: number;
  user: User = {} as any;
  defaultProfileImageKey = "default_profile_image.png"
  signedProfileImageUrl = "";

  token: string;

  // update alerts
  shareOpportunitiesUpdate = false;
  shareAppliedUpdate = false;
  shareInterviewsUpdate = false;
  shareOffersUpdate = false;
  profileFirstNameUpdate = false;
  profileLastNameUpdate = false;
  profileEmailUpdate = false;
  profileBioUpdate = false;

  // failure alerts
  sharingFailureAlert = false;

  // watch changes
  emailHasChanged = false;
  firstNameHasChanged = false;
  lastNameHasChanged = false;
  bioHasChanged = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService
  ) {
    this.user.first_name = this.user.last_name = '';
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
      'email': [this.user.email, [Validators.email]],
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

  // function called when the sharing settings form is submitted
  onSharingSubmit() {
    // reset alerts
    this.shareOpportunitiesUpdate = this.shareAppliedUpdate = this.shareInterviewsUpdate = this.shareOffersUpdate = false;

    // update user sharing by calling the api
    this.manage.updateUserSharing(this.user_id, this.sharingForm.value)
      .subscribe(data => {
        // on success remove error alert if it exists
        this.sharingFailureAlert = false;

        // display alerts that the values were updated
        if(this.user.share_opportunities !== data.data.update_user_sharing.share_opportunities) {
          this.shareOpportunitiesUpdate = true;
        }
        if(this.user.share_applied !== data.data.update_user_sharing.share_applied) {
          this.shareAppliedUpdate = true;
        }
        if(this.user.share_interviews !== data.data.update_user_sharing.share_interviews) {
          this.shareInterviewsUpdate = true;
        }
        if(this.user.share_offers !== data.data.update_user_sharing.share_offers) {
          this.shareOffersUpdate = true;
        }

        // set user to the updated user
        this.user = data.data.update_user_sharing;
      }, error => {
        console.log(error);
        // handle errors
        this.sharingFailureAlert = true;
      });
  }

  // when the user clicks save to save changes to the edit profile section
  onEditProfileSubmit() {
    var form_values = this.editForm.value;

    // validate changes
    form_values.email = (form_values.email === this.user.email || form_values.email === '') ? null : form_values.email;
    form_values.firstName = (form_values.firstName === this.user.first_name || form_values.firstName === '') ? null : form_values.firstName;
    form_values.lastName = (form_values.lastName === this.user.last_name || form_values.lastName === '') ? null : form_values.lastName;
    form_values.bio = (form_values.bio === this.user.bio || form_values.bio === '') ? null : form_values.bio;

    // call api to update user profile changes
    this.manage.updateUserProfile(this.user_id, this.editForm.value)
      .subscribe(data => {
        console.log(data);
        // reset form
        this.editForm.reset();

        // display alerts that the values were updated
        if(this.user.first_name !== data.data.update_user_profile.first_name) {
          this.profileFirstNameUpdate = true;
        }
        if(this.user.last_name !== data.data.update_user_profile.last_name) {
          this.profileLastNameUpdate = true;
        }
        if(this.user.email !== data.data.update_user_profile.email) {
          this.profileEmailUpdate = true;
        }
        if(this.user.bio !== data.data.update_user_profile.bio) {
          this.profileBioUpdate = true;
        }

        // set user to the updated user returned
        this.user = data.data.update_user_profile;
      }, error => {
        console.log(error);
        // handle errors
      });
  }

  // when the profile image file has changed
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
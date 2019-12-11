import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { User } from './../../models/user.model';

import { faQuestionCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

import { ManageService } from './../manage.service';

// const imgPath = './../../../.profile_images/default_profile.png';

@Component({
  selector: 'app-profile',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  // font awesome variables
  faQuestionCircle = faQuestionCircle;
  faTimes = faTimes;

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
  isPrivateUpdate = false;
  profileFirstNameUpdate = false;
  profileLastNameUpdate = false;
  profileEmailUpdate = false;
  profileBioUpdate = false;
  displayImageUpdate = false;

  // failure alerts
  sharingFailureAlert = false;
  editProfileFailureAlert = false;
  displayDeleteError = false;

  // watch changes
  emailHasChanged = false;
  firstNameHasChanged = false;
  lastNameHasChanged = false;
  bioHasChanged = false;

  displayDeleteAccountModal = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService
  ) {
    this.user.first_name = this.user.last_name = '';
  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
    // console.log("cookies: ", this.cookieService.getAll());
    this.user_id = jwt_decode(this.token)['sub'].toString();

    // set values retrieved from user
    this.sharingForm = this.fb.group({
      'shareOpportunities': [this.user.share_opportunities, []],
      'shareApplied': [this.user.share_applied, []],
      'shareInterviews': [this.user.share_interviews, []],
      'shareOffers': [this.user.share_offers, []],
      'isPrivate': [this.user.is_private, []],
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
      // console.log(data);
      if(data.data === null) {
        this.cookieService.delete('SESSIONID', '/');
        this.router.navigate(['/login']);
      } else {
        // set this component's user to the data returned
        this.user = data.data;

        // set check box values
        this.sharingForm.get('shareOpportunities').setValue(this.user.share_opportunities);
        this.sharingForm.get('shareApplied').setValue(this.user.share_applied);
        this.sharingForm.get('shareInterviews').setValue(this.user.share_interviews);
        this.sharingForm.get('shareOffers').setValue(this.user.share_offers);
        this.sharingForm.get('isPrivate').setValue(this.user.is_private);

        // update the profile image src url with a signed s3 url
        if(this.user.profile_image_file_id === null) {
          this.signedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey, this.defaultProfileImageKey);
        } else {
          this.signedProfileImageUrl = this.manage.getAttachment(this.user.profile_image_file_id.file_name, this.user.profile_image_file_id.original_name);
        }
      }
    });
  }

  // function called when the sharing settings form is submitted
  onSharingSubmit() {
    // reset alerts
    this.shareOpportunitiesUpdate = false;
    this.shareAppliedUpdate = false;
    this.shareInterviewsUpdate = false;
    this.shareOffersUpdate = false;
    this.isPrivateUpdate = false;

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
        if(this.user.is_private !== data.data.update_user_sharing.is_private) {
          this.isPrivateUpdate = true;
        }

        // set user to the updated user
        this.user = data.data.update_user_sharing;
      }, error => {
        // console.log(error);
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
        // console.log(data);
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
        // console.log(error);
        // handle errors
        this.editProfileFailureAlert = true;
      });
  }

  // display the are you sure option
  deleteAccountClicked() {
    this.displayDeleteAccountModal = true;
  }

  // call api to delete account
  onYesDeleteClick() {
    // console.log('deleting user:', this.user_id);
    this.manage.deleteUser(this.user_id)
      .subscribe(data => {
        // console.log(data);
        this.cookieService.delete('SESSIONID', '/');
        this.router.navigate(['/login']);
      }, err => {
        // console.log(err);
        this.displayDeleteError = true;
      });
  }

  // revert back to the delete account button
  onNoDeleteClick() {
    this.displayDeleteAccountModal = false;
  }

  // when the profile image file has changed
  onFileChange(event) {
    // console.log(event);
    // save profile image to database and assign the user to it
    this.manage.saveProfileImage(event, this.user_id)
      .subscribe(data => {
        // update the current profile image src url
        this.signedProfileImageUrl = this.manage.getAttachment(data.file, data.file);
        this.displayImageUpdate = true;
      });
  }
}

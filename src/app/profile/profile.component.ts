import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Job } from './../../models/job.model';
import { User } from './../../models/user.model';
import { File } from './../../models/file.model';

import { ManageService } from './../manage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user_id: number;
  user: User = {} as any;
  defaultProfileImageKey = "default_profile_image.png"
  signedProfileImageUrl = "";

  profileUserId: number;
  profileUser: User = {} as any;

  token: string;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');

    this.user_id = jwt_decode(this.token).sub.toString();

    // get user data
    this.manage.getUser(this.user_id).subscribe(data => {
      console.log(data);

      // set this component's user to the data returned
      this.user = data.data;

      // update the profile image src url with a signed s3 url
      if(this.user.profile_image_file_id === null) {
        this.signedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
      } else {
        this.signedProfileImageUrl = this.manage.getAttachment(this.user.profile_image_file_id.file_name);
      }
    });

    this.activatedRoute.params.subscribe(params => {
      // set user id of request profile to view
      this.profileUserId = +params['id'];

      // get requested profile user data
      this.manage.getUser(this.profileUserId).subscribe(data => {
        console.log(data);

        // set this component's user to the data returned
        this.profileUser = data.data;

        // update the profile image src url with a signed s3 url
        if(this.profileUser.profile_image_file_id === null) {
          this.signedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
        } else {
          this.signedProfileImageUrl = this.manage.getAttachment(this.profileUser.profile_image_file_id.file_name);
        }
      });
    });
  }

}

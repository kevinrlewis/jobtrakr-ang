import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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
  userLookupSignedProfileImageUrl = "";
  userSignedProfileImageUrl = ""

  // data about the profile being looked up
  profileUserId: number;
  profileUser: User = {} as any;

  jobsArray: Job[] = [];
  jobsObservable: Observable<Array<Job>>;

  token: string;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.jobsObservable = of(this.jobsArray);
  }

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
        this.userSignedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
      } else {
        this.userSignedProfileImageUrl = this.manage.getAttachment(this.user.profile_image_file_id.file_name);
      }
    });

    this.activatedRoute.params.subscribe(params => {
      // set user id of request profile to view
      this.profileUserId = +params['id'];

      // get requested profile user data
      this.manage.getUser(this.profileUserId).subscribe(profileData => {
        console.log(profileData);

        // set this component's user to the data returned
        this.profileUser = profileData.data;

        // if the profile user exists
        if(this.profileUser !== null) {
          // if the profile user allows jobs to be shared
          if(this.profileUser.share_applied || this.profileUser.share_interviews || this.profileUser.share_opportunities || this.profileUser.share_offers) {
            // get jobs for the profile desired
            this.manage.getJobs(this.profileUserId).subscribe(jobs => {
              console.log(jobs);
              // iterate jobs and add to array
              jobs.data.forEach(job => {
                this.jobsArray.push(job);
              })
            });
          }
          // update the profile image src url with a signed s3 url
          if(this.profileUser.profile_image_file_id === null) {
            this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
          } else {
            this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.profileUser.profile_image_file_id.file_name);
          }
        }
      });
    });
  }

  onNavBarClick(link) {
    console.log('profile component navbar click!');
    console.log(link);
    // this.compRef.destroy();
    this.router.navigate([link]);
  }

}

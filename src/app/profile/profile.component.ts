import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

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

  opportunitiesArray: Job[] = [];
  appliedArray: Job[] = [];
  interviewsArray: Job[] = [];
  offersArray: Job[] = [];

  opportunitiesObservable: Observable<Array<Job>>;
  appliedObservable: Observable<Array<Job>>;
  interviewsObservable: Observable<Array<Job>>;
  offersObservable: Observable<Array<Job>>;

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
    this.opportunitiesObservable = of(this.opportunitiesArray);
    this.appliedObservable = of(this.appliedArray);
    this.interviewsObservable = of(this.interviewsArray);
    this.offersObservable = of(this.offersArray);
  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');

    this.user_id = jwt_decode(this.token).sub.toString();

    this.getCurrentUserData();

    this.activatedRoute.params.subscribe(params => {
      // set user id of request profile to view
      this.profileUserId = +params['id'];
      this.getProfileUserData(this.profileUserId);
    });
  }

  getCurrentUserData() {
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
  }

  // https://medium.com/@paynoattn/3-common-mistakes-i-see-people-use-in-rx-and-the-observable-pattern-ba55fee3d031
  getProfileUserData(id) {
    this.jobsArray = [];
    this.opportunitiesArray = [];
    // get requested profile user data
    let getUserObservable = this.manage.getUser(id);
    getUserObservable.subscribe(profileData => {
        console.log(profileData);

        // set this component's user to the data returned
        this.profileUser = profileData.data;
        if(this.profileUser !== null) {
          let getJobsObservable = this.manage.getJobs(id);
          getJobsObservable.subscribe(response => {
            console.log(response);
            if(response.data !== null) {
              let tempJobsObservable = from(response.data);
              // let opportunitiesFilter = getJobsObservable.pipe(filter(job => job.job_type_id === 1));
              // let appliedFilter = getJobsObservable.pipe(filter(job => job.job_type_id === 2));
              // let interviewsFilter = getJobsObservable.pipe(filter(job => job.job_type_id === 3));
              // let offersFilter = getJobsObservable.pipe(filter(job => job.job_type_id === 4));
              tempJobsObservable.subscribe(data => console.log(data));
              tempJobsObservable.pipe(filter(job => job.job_type_id === 1))
                .subscribe(job => {
                  this.opportunitiesArray.push(job);
                });
              tempJobsObservable.pipe(filter(job => job.job_type_id === 2))
                .subscribe(job => {
                  this.appliedArray.push(job);
                });
              tempJobsObservable.pipe(filter(job => job.job_type_id === 3))
                .subscribe(job => {
                  this.interviewsArray.push(job);
                });
              tempJobsObservable.pipe(filter(job => job.job_type_id === 4))
                .subscribe(job => {
                  this.offersArray.push(job);
                });
            }
          });
        }
    })


    // .subscribe(profileData => {
    //   console.log(profileData);
    //
    //   // set this component's user to the data returned
    //   this.profileUser = profileData.data;
    //
    //   // if the profile user exists
    //   if(this.profileUser !== null) {
    //     this.appliedArray = [];
    //     this.opportunitiesArray = [];
    //     // if the profile user allows jobs to be shared
    //     if(this.profileUser.share_applied || this.profileUser.share_interviews || this.profileUser.share_opportunities || this.profileUser.share_offers) {
    //       // get jobs for the profile desired
    //       this.manage.getJobs(id).subscribe(jobs => {
    //         console.log(jobs);
    //         if(jobs.data != null) {
    //           // iterate jobs and add to array
    //           jobs.data.forEach(job => {
    //             if(job.job_type_id === 1) {
    //               this.opportunitiesArray.push(job);
    //             } else if(job.job_type_id === 2) {
    //               this.appliedArray.push(job);
    //             } else if(job.job_type_id === 3) {
    //               this.interviewsArray.push(job);
    //             } else if(job.job_type_id === 4) {
    //               this.offersArray.push(job);
    //             }
    //             this.jobsArray.push(job);
    //           });
    //         }
    //       });
    //     }
    //     // update the profile image src url with a signed s3 url
    //     if(this.profileUser.profile_image_file_id === null) {
    //       this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
    //     } else {
    //       this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.profileUser.profile_image_file_id.file_name);
    //     }
    //   }
    // });
  }

  onNavBarClick(link) {
    console.log('profile component navbar click!');
    console.log(link);
    // this.compRef.destroy();
    this.router.navigate([link]);
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { from, of, forkJoin, empty } from 'rxjs';
import { filter, map, take, switchMap, flatMap } from 'rxjs/operators';

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

  userId: number;
  user: User = {} as any;
  defaultProfileImageKey = "default_profile_image.png"
  userLookupSignedProfileImageUrl = "";
  userSignedProfileImageUrl = ""

  // data about the profile being looked up
  profileUserId: number;
  profileUser: User = {} as any;

  jobsObservable: Observable<Array<Job>>;
  opportunitiesObservable: Observable<Array<Job>>;
  appliedObservable: Observable<Array<Job>>;
  interviewsObservable: Observable<Array<Job>>;
  offersObservable: Observable<Array<Job>>;

  usersObservable: Observable<Array<User>>;

  token: string;

  // boolean trigger values
  disableSubscribe: boolean = true;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');

    this.userId = jwt_decode(this.token).sub.toString();

    this.getCurrentUserData();

    this.activatedRoute.params.subscribe(params => {
      // set user id of request profile to view
      this.profileUserId = +params['id'];
      this.getProfileUserData(this.profileUserId);

      this.disableSubscribe = (this.profileUserId == this.userId);

      this.getUsersToDisplay();
    });
  }

  getCurrentUserData() {
    // get user data
    this.manage.getUser(this.userId).subscribe(data => {
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
    // get requested profile user data
    this.jobsObservable = this.manage.getUser(id)
      .pipe(map(profileData => {
        // set this component's user to the data returned
        this.profileUser = profileData.data;

        // update the profile image src url with a signed s3 url
        if(this.profileUser.profile_image_file_id === null) {
          this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey);
        } else {
          this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.profileUser.profile_image_file_id.file_name);
        }

        return (this.profileUser) ? this.manage.getJobs(id) : empty();
      }))
      .pipe(switchMap(getJobs => {
        return getJobs;
      }))
      .pipe(map(({ data }) => {
        return data;
      }));

    // TODO: figure out how to apply filters without calling the api per job type (4 times)
    // filter observables by job type
    this.opportunitiesObservable = this.jobsObservable.pipe(map(jobs => (jobs != null) ? jobs.filter(job => job.job_type_id === 1) : null));
    this.appliedObservable = this.jobsObservable.pipe(map(jobs => (jobs != null) ? jobs.filter(job => job.job_type_id === 2) : null));
    this.interviewsObservable = this.jobsObservable.pipe(map(jobs => (jobs != null) ? jobs.filter(job => job.job_type_id === 3) : null));
    this.offersObservable = this.jobsObservable.pipe(map(jobs => (jobs != null) ? jobs.filter(job => job.job_type_id === 4) : null));
  }

  /*
    retrieve other users to display
  */
  getUsersToDisplay() {
    this.usersObservable = this.manage.getUsers(10)
      .pipe(
        map(({ data }) => { return data; })
      )
      .pipe(
        map(users => (users != null) ? users.filter(u => u.user_id != this.userId) : null)
      );
  }

  // handle a click when user clicks other users
  userClick(id) {
    this.router.navigate(['profile/' + id]);
  }

}

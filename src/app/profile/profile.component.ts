import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from 'jwt-decode';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of, empty } from 'rxjs';
import { map, switchMap  } from 'rxjs/operators';

import { Job } from './../../models/job.model';
import { User } from './../../models/user.model';

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

  // observables
  profileUserObservable: Observable<User>;
  jobsObservable: Observable<Array<Job>>;
  opportunitiesObservable: Observable<Array<Job>>;
  appliedObservable: Observable<Array<Job>>;
  interviewsObservable: Observable<Array<Job>>;
  offersObservable: Observable<Array<Job>>;
  usersObservable: Observable<Array<User>>;

  // id token
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
    this.userId = jwt_decode(this.token)['sub'].toString();
    this.getCurrentUserData();

    this.activatedRoute.params.subscribe(params => {
      // set user id of request profile to view
      this.profileUserId = +params['id'];

      // get requested profile user data
      this.profileUserObservable = this.manage.getUser(this.profileUserId)
        .pipe(map(profileData => {
          // set this component's user to the data returned
          this.profileUser = profileData.data;

          // update the profile image src url with a signed s3 url
          if(this.profileUser.profile_image_file_id === null) {
            this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey, this.defaultProfileImageKey);
          } else {
            this.userLookupSignedProfileImageUrl = this.manage.getAttachment(this.profileUser.profile_image_file_id.file_name, this.profileUser.profile_image_file_id.original_name);
          }

          return this.profileUser;
        }));



      // get jobs for the profile requested
      this.jobsObservable = this.manage.getJobs(this.profileUserId)
        .pipe(
          map(getJobs => {
            return getJobs;
          }),
          switchMap(({ data }) => {
            // console.log(data);
            return of(data);
          })
        );

      // filter observables by job type
      this.jobsObservable.subscribe(data => {
        this.opportunitiesObservable = data ? of(data.filter(job => job.job_type_id === 1)) : empty();
        this.appliedObservable = data ? of(data.filter(job => job.job_type_id === 2)) : empty();
        this.interviewsObservable = data ? of(data.filter(job => job.job_type_id === 3)) : empty();
        this.offersObservable = data ? of(data.filter(job => job.job_type_id === 4)) : empty();
      });

      // disable the subscribe button if user is looking at their own profile
      this.disableSubscribe = (this.profileUserId == this.userId);

      // get other users to display
      this.getUsersToDisplay();
    });
  }

  getCurrentUserData() {
    // get user data
    this.manage.getUser(this.userId).subscribe(data => {
      // console.log(data);

      // set this component's user to the data returned
      this.user = data.data;

      // update the profile image src url with a signed s3 url
      if(this.user.profile_image_file_id === null) {
        this.userSignedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey, this.defaultProfileImageKey);
      } else {
        this.userSignedProfileImageUrl = this.manage.getAttachment(this.user.profile_image_file_id.file_name, this.user.profile_image_file_id.original_name);
      }
    });
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

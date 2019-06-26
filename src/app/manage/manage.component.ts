import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
// import { NgDragDropModule } from 'ng-drag-drop';

import { ManageService } from './../manage.service';

import { Job } from './../../models/job.model';
import { User } from './../../models/user.model';

// icons
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faTh } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

const API_URL = environment.apiUrl;

const POSSIBLE_JOB_TYPES = ['opportunity', 'applied', 'interview', 'offer', 'archive'];

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        display: 'block',
        opacity: '1'
      })),
      state('closed', style({
        display: 'none',
        opacity: '0'
      })),
      transition('open => closed', [
        animate('.1s')
      ]),
      transition('closed => open', [
        animate('.5s')
      ]),
    ]),
    trigger('slideDown', [
      state('open', style({
        display: 'block',
        opacity: '1'
      })),
      state('closed', style({
        display: 'none',
        opacity: '0'
      })),
      transition('open => closed', [
        animate('2s')
      ]),
      transition('closed => open', [
        animate('2s')
      ]),
    ])
  ]
})
export class ManageComponent implements OnInit, AfterViewInit {
  // animation state variables
  state:string = 'closed';
  jobTypeState:string = 'closed';

  // font awesome icones
  faBars = faBars;
  faTh = faTh;
  faQuestionCircle = faQuestionCircle;

  // @Input() email: string;
  user: User;
  job_type_view: number;

  id: string;
  email: string;
  firstName: string;
  lastName: string;

  // booleans
  opportunities_active: boolean;
  applied_active: boolean;
  interviews_active: boolean;
  offers_active: boolean;
  archive_active: boolean;
  show_buttons: boolean;
  show_grid: boolean;

  // arrays
  jobsArray: Job[] = [];
  opportunitiesArray: Job[] = [];
  appliedArray: Job[] = [];
  interviewArray: Job[] = [];
  offerArray: Job[] = [];
  archiveArray: Job[] = [];

  // constant maps
  jobTypeCounts = { };
  jobMap = { 'opportunity': this.opportunitiesArray, 'applied': this.appliedArray, 'interview': this.interviewArray, 'offer': this.offerArray, 'archive': this.archiveArray };
  jobIdMap = { 'opportunity': 1, 'applied': 2, 'interview': 3, 'offer': 4, 'archive': 5 };
  jobIdToNameMap = { 1: 'opportunity', 2: 'applied', 3: 'interview', 4: 'offer', 5: 'archive' };

  // observables for the job arrays
  opportunitiesObservable: Observable<Array<Job>>;
  appliedObservable: Observable<Array<Job>>;
  interviewObservable: Observable<Array<Job>>;
  offerObservable: Observable<Array<Job>>;
  jobsObservable: Observable<Array<Job>>;
  archiveObservable: Observable<Array<Job>>;

  droppedData: string;

  // profile image for header
  defaultProfileImageKey = "default_profile_image.png"
  signedProfileImageUrl = "";

  token: string;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private manage: ManageService,
    private change: ChangeDetectorRef
  ) {
    this.state = 'closed';
    this.jobTypeState = 'closed';
    this.id = this.email = this.firstName = this.lastName = "";

    router.events.subscribe((val) => {
        let element = document.getElementsByClassName("background") as HTMLCollectionOf<HTMLElement>;
        element[0].style.background = 'rgb(255, 255, 255, 1)';
        // document.body.style.background = 'rgb(255, 255, 255, 1)';
    });

    // initialize the observables
    this.opportunitiesObservable = of(this.jobMap['opportunity']);
    this.appliedObservable = of(this.jobMap['applied']);
    this.interviewObservable = of(this.jobMap['interview']);
    this.offerObservable = of(this.jobMap['offer']);
    this.archiveObservable = of(this.jobMap['archive']);
    this.jobsObservable = of(this.jobsArray);
  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
    // console.log("cookies: ", this.cookieService.getAll());

    // subscibe to detect fragments when this component is initialized
    this.activatedRoute.fragment.subscribe(frag => {
      // if opportunities then display opportunities component
      if(frag === 'opportunities') {
        // this.opportunities_active = true;
        this.job_type_view = 1;
      // if applied then display applied component
      } else if (frag === 'applied') {
        // this.applied_active = true;
        this.job_type_view = 2;
      // if interviews then display interviews component
      } else if (frag === 'interviews') {
        // this.interviews_active = true;
        this.job_type_view = 3;
      // if offers then display offers component
      } else if (frag === 'offers') {
        // this.offers_active = true;
        this.job_type_view = 4;
      // if archive then display archive component
      } else if (frag === 'archive') {
        this.job_type_view = 5;
      // otherwise set initial variables and show the buttons
      } else {
        this.job_type_view = 0;
        this.setInitVariables();

        this.show_buttons = true;
        this.show_grid = false;

        // testing grid
        // this.show_buttons = false;
        // this.show_grid = true;

      }
    });

    // get id from token
    this.id = jwt_decode(this.token).sub.toString();

    // get user information
    this.http.get<GetUserResponse>(
      API_URL + '/api/user/id/' + this.id,
      httpOptions
    ).subscribe(data => {
      // console.log(data);
      if(data.data === null) {
        this.cookieService.delete('SESSIONID', '/');
        this.router.navigate(['/login']);
      } else {
        this.user = data.data;

        this.email = data.data.email;
        this.firstName = data.data.first_name;
        this.lastName = data.data.last_name;

        // update the profile image src url with a signed s3 url
        if(this.user.profile_image_file_id === null) {
          this.signedProfileImageUrl = this.manage.getAttachment(this.defaultProfileImageKey, this.defaultProfileImageKey);
        } else {
          this.signedProfileImageUrl = this.manage.getAttachment(this.user.profile_image_file_id.file_name, this.user.profile_image_file_id.original_name);
        }
      }
    });

    // call the helper function to refresh the jobs within the grid
    this.refreshJobs();
  }

  ngAfterViewInit() {
    this.state = 'open';
    this.change.detectChanges();
  }

  /*
    set initial variables
  */
  setInitVariables() {
    this.opportunities_active = this.applied_active = this.interviews_active = this.offers_active = this.archive_active = false;
  }

  onJobDrop(event:any): void {
    // console.log(event.nativeEvent);
    var old_job_type = 0;
    var new_job_type = "";

    // get old_job_type from data that was passed during event
    old_job_type = event.dragData.job_type_id;

    // get new_job_type from html elements
    // TODO: rethink this?
    let path = event.nativeEvent.path;
    // set val to the drop area [dropScope]
    let val = "";
    // iterate the elements in the path of the event
    path.forEach(function(el:HTMLDivElement) {
      // set undefined values to an empty string
      let temp_id = (el.id === undefined) ? "" : el.id;

      // check if the div contains the id we are looking for
      if(temp_id !== "" && temp_id.substring(temp_id.length - 8) === "DropArea") {
        // retrieve desired element attribute values
        val = el.attributes[5].value;
      }
    });

    /*
      use the val from the html element to determine the drop destination
      since the drop area has a drop scope that will accept everything except
      itself meaning if we determine the missing job type then that will be the
      desired job_type
    */
    new_job_type = this.determine_drop_destination(val);

    // move the job
    this.moveJob(event.dragData, old_job_type, new_job_type);
  }

  /*
    function that takes a job object, a old job type string and a new job type
    string and will move that job object between arrays within the jobMap
  */
  moveJob(job: Job, oldJobTypeId: number, newJobType: string) {
    var oldJobType = this.jobIdToNameMap[oldJobTypeId];
    // console.log("old job type:", oldJobType, "| new job type:", newJobType);
    try {
      // determine index of the job we are removing from the old array
      var index = this.jobMap[oldJobType].indexOf(job);

      // if the job was found in the array
      if(index > -1) {
        // splice it out of the array
        this.jobMap[oldJobType].splice(index, 1);
      }
    }
    // catch error and display an error message
    catch(e) {
      console.log(e);
    }

    // reset values to the new job_type
    job.job_type_id = this.jobIdMap[newJobType];

    // push the updated job to the new array
    this.jobMap[this.jobIdToNameMap[job.job_type_id]].push(job);

    // call api
    this.manage.updateJobType(job.user_id, job.jobs_id, job.job_type_id)
      .subscribe(data => {
        // console.log(data);
      });
  }

  /*
    function to determine the missing job type in a comma separated string
  */
  determine_drop_destination(k:string) {
    // split string into an array
    var temp = k.split(',');

    // store length of array
    var length_arr = POSSIBLE_JOB_TYPES.length;
    var reconstruct_arr = [];

    // length of temp
    var temp_length = temp.length;
    // iterate both the temp array and possible job types
    // to then determine and reconstruct what job types
    // are in the DropScope
    for(var i = 0; i < temp_length; i++) {
      for(var j = 0; j < length_arr; j++) {
        if(POSSIBLE_JOB_TYPES[j].includes(temp[i])) {
          reconstruct_arr.push(POSSIBLE_JOB_TYPES[j]);
        }
      }
    }

    // length of reconstructed array
    var reconstruct_arr_len = reconstruct_arr.length;
    // iterate possible job types
    for(var i = 0; i < length_arr; i++) {
      // if the string does not contain one of the POSSIBLE_JOB_TYPES
      // then return that type
      if(!reconstruct_arr.includes(POSSIBLE_JOB_TYPES[i])) {
        return POSSIBLE_JOB_TYPES[i];
      }
    }
    // reset array
    reconstruct_arr = [];
  }

  /*
    when the opportunities button is clicked
    display the opportunities component
  */
  toggleOpportunitiesActive() {
    // this.opportunities_active = !this.opportunities_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'opportunities' });
    this.jobTypeState = 'open';
    this.change.detectChanges();
  }

  /*
    when the applied button is clicked
    display the applied component
  */
  toggleAppliedActive() {
    // this.applied_active = !this.applied_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'applied' });
    this.jobTypeState = 'open';
    this.change.detectChanges();
  }

  /*
    when the interview button is clicked
    display the interview component
  */
  toggleInterviewsActive() {
    // this.interviews_active = !this.interviews_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'interviews' });
    this.jobTypeState = 'open';
    this.change.detectChanges();
  }

  /*
    when the offer button is clicked
    display the offer component
  */
  toggleOffersActive() {
    // this.offers_active = !this.offers_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'offers' });
    this.jobTypeState = 'open';
    this.change.detectChanges();
  }

  /*
    when the archive button is clicked
    display the archive component
  */
  toggleArchiveActive() {
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'archive' });
    this.jobTypeState = 'open';
    this.change.detectChanges();
  }

  /*
    check if on of the job type sub components is active
  */
  isSubComponentActive() {
    // console.log('isSubComponentActive: ', (this.opportunities_active || this.applied_active || this.interviews_active || this.offers_active));
    // return (this.opportunities_active || this.applied_active || this.interviews_active || this.offers_active);
    return this.job_type_view !== 0;
  }

  /*
    when the settings button tab is clicked
  */
  settingsClicked() {
    this.router.navigate(['profile/' + jwt_decode(this.token).sub]);
  }

  /*
    if the grid button is clicked, display the grid view
  */
  selectGrid() {
    this.show_buttons = false;
    this.show_grid = true;
    this.refreshJobs();
  }

  /*
    if the buttons button is clicked, display the buttons div
  */
  selectButtons() {
    this.show_grid = false;
    this.show_buttons = true;
  }

  /*
    refreshes the grid and the jobs within the grid
    really refreshes the jobs available to grab within the manage
    component
  */
  refreshJobs() {
    // call the api within the manage service to get jobs
    this.manage.getJobs(this.id).subscribe(data => {
      // call helper function to reset the job arrays
      this.resetJobsArrays();

      // console.log('/api/job/id response', data);
      // store all jobs in array
      this.jobsArray = data.data;

      /*
        check if there are no jobs, if so then we do not want to create
        an observable out of null
      */
      if(data.data !== null) {
        // temp observable
        var temp = from(data.data);

        // filter and add all jobs to their specific array
        temp.subscribe(job => {
          this.jobMap[this.jobIdToNameMap[job.job_type_id]].push(job);
        });

      }
      // call helper function to reload the observables
      this.reloadObservables();
    });
  }

  /*
    reset arrays within the job map to refresh the grid
  */
  resetJobsArrays() {
    // iterate over the possible job types to iterate the job map
    POSSIBLE_JOB_TYPES.forEach(job_type_name => {
      this.jobMap[job_type_name] = [];
    });
  }

  /*
    something weird happens when the arrays within the job map are reset
    so we need to re assign the observables to those arrays
  */
  reloadObservables() {
    this.opportunitiesObservable = of(this.jobMap['opportunity']);
    this.appliedObservable = of(this.jobMap['applied']);
    this.interviewObservable = of(this.jobMap['interview']);
    this.offerObservable = of(this.jobMap['offer']);
    this.archiveObservable = of(this.jobMap['archive']);
  }
}

// interface for the response from getting the user
interface GetUserResponse {
  message: string,
  data: User
}

// interface to get an expected response from the api
// when we call the api to get all jobs interviewing
export interface GetJobsResponse {
  message: string,
  data: {
    get_jobs_by_user_id: Job[]
  }
}

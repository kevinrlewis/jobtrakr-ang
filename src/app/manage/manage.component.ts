import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators'
// import { NgDragDropModule } from 'ng-drag-drop';

// icons
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faTh } from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Credentials': 'true'
  }),
  // withCredentials: true,
  // credentials: 'include'
};

const POSSIBLE_JOB_TYPES = ['opportunity', 'applied', 'interview', 'offer'];

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  faBars = faBars;
  faTh = faTh;

  // @Input() email: string;
  user: object;
  id: string;
  email: string;
  firstname: string;
  lastname: string;

  // booleans
  opportunities_active: boolean;
  applied_active: boolean;
  interviews_active: boolean;
  offers_active: boolean;
  show_buttons: boolean;
  show_grid: boolean;

  // arrays
  jobsArray: Job[] = [];
  opportunitiesArray: Job[] = [];
  appliedArray: Job[] = [];
  interviewArray: Job[] = [];
  offerArray: Job[] = [];

  // constant maps
  jobMap = { 'opportunity': this.opportunitiesArray, 'applied': this.appliedArray, 'interview': this.interviewArray, 'offer': this.offerArray };
  jobIdMap = { 'opportunity': 1, 'applied': 2, 'interview': 3, 'offer': 4 };

  // observables for the job arrays
  opportunitiesObservable: Observable<Array<Job>>;
  appliedObservable: Observable<Array<Job>>;
  interviewObservable: Observable<Array<Job>>;
  offerObservable: Observable<Array<Job>>;
  jobsObservable: Observable<Array<Job>>;

  //
  droppedData: string;

  token: string;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.id = this.email = this.firstname = this.lastname = "";

    router.events.subscribe((val) => {
        document.body.style.background = 'rgb(255, 255, 255, 1)';
    });

    // initialize the observables
    this.opportunitiesObservable = of(this.jobMap['opportunity']);
    this.appliedObservable = of(this.jobMap['applied']);
    this.interviewObservable = of(this.jobMap['interview']);
    this.offerObservable = of(this.jobMap['offer']);
    this.jobsObservable = of(this.jobsArray);
  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
    // console.log("cookies: ", this.cookieService.getAll());

    // subscibe to detect fragments when this component is initialized
    this.activatedRoute.fragment.subscribe(frag => {
      // if opportunities then display opportunities component
      if(frag === 'opportunities') {
        this.opportunities_active = true;
      // if applied then display applied component
      } else if (frag === 'applied') {
        this.applied_active = true;
      // if interviews then display interviews component
      } else if (frag === 'interviews') {
        this.interviews_active = true;
      // if offers then display offers component
      } else if (frag === 'offers') {
        this.offers_active = true;
      // otherwise set initial variables and show the buttons
      } else {
        this.setInitVariables();
        // don't show grid first
        // this.show_buttons = true;
        // this.show_grid = false;

        // testing grid
        this.show_buttons = false;
        this.show_grid = true;
      }
    });

    // get id from token
    this.id = jwt_decode(this.token).sub.toString();

    // get user information
    this.http.get<GetUserResponse>(
      '/api/user/id/' + this.id,
      httpOptions
    ).subscribe(data => {
      console.log(data);
      this.user = data.data;

      this.email = data.data.email;
      this.firstname = data.data.firstname;
      this.lastname = data.data.lastname;
    });

    // get all jobs
    this.http.get<GetJobsResponse>(
      '/api/job/id/' + this.id,
      httpOptions
    ).subscribe(data => {
      // store all jobs in array
      this.jobsArray = data.data.get_jobs_by_user_id;

      // temp observable
      var temp = from(data.data.get_jobs_by_user_id);

      // filter and add all jobs to their specific array
      temp.subscribe(job => {
        this.jobMap[job.job_type_name].push(job);
      });
    });

  }

  // set initial variables
  setInitVariables() {
    this.opportunities_active = this.applied_active = this.interviews_active = this.offers_active = false;
  }

  onJobDrop(event:any): void {
    console.log(event.nativeEvent);
    var old_job_type = "";
    var new_job_type = "";

    // get old_job_type from data that was passed during event
    old_job_type = event.dragData.job_type_name

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
  moveJob(job: Job, oldJobType: string, newJobType: string) {
    console.log("old job type:", oldJobType, "new job type:", newJobType);
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
    job.job_type_name = newJobType;
    job.job_type_id = this.jobIdMap[newJobType];

    // push the updated job to the new array
    this.jobMap[newJobType].push(job);
  }

  // function to determine the missing job type in a comma separated string
  determine_drop_destination(k:string) {
    // split string into an array
    var temp = k.split(',');

    // store length of array
    var length_arr = POSSIBLE_JOB_TYPES.length;

    // iterate possible job types
    for(var i = 0; i < length_arr; i++) {
      // if the string does not contain one of the POSSIBLE_JOB_TYPES
      // then return that type
      if(!temp.includes(POSSIBLE_JOB_TYPES[i])) {
        return POSSIBLE_JOB_TYPES[i];
      }
    }
  }

  // when the opportunities button is clicked
  // display the opportunities component
  toggleOpportunitiesActive() {
    this.opportunities_active = !this.opportunities_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'opportunities' });
  }

  // when the applied button is clicked
  // display the applied component
  toggleAppliedActive() {
    this.applied_active = !this.applied_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'applied' });
  }

  // when the interview button is clicked
  // display the interview component
  toggleInterviewsActive() {
    this.interviews_active = !this.interviews_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'interviews' });
  }

  // when the offer button is clicked
  // display the offer component
  toggleOffersActive() {
    this.offers_active = !this.offers_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'offers' });
  }

  // check if on of the job type sub components is active
  isSubComponentActive() {
    // console.log('isSubComponentActive: ', (this.opportunities_active || this.applied_active || this.interviews_active || this.offers_active));
    return (this.opportunities_active || this.applied_active || this.interviews_active || this.offers_active);
  }

  // when the settings button tab is clicked
  settingsClicked() {
    this.router.navigate(['profile/' + jwt_decode(this.token).sub]);
  }

  // if the grid button is clicked, display the grid view
  selectGrid() {
    this.show_buttons = false;
    this.show_grid = true;
  }

  // if the buttons button is clicked, display the buttons div
  selectButtons() {
    this.show_grid = false;
    this.show_buttons = true;
  }
}

// interface for the response from getting the user
interface GetUserResponse {
  message: string,
  data: {
    user_id: number,
    email: string,
    firstname: string,
    lastname: string
  }
}

// interface for the response from getting jobs
interface GetJobsResponse {
  message: string,
  data: {
    get_jobs_by_user_id: [ {
      jobs_id: number,
      job_title: string,
      company_name: string,
      link: string,
      notes: string,
      attachments: string,
      user_id: number,
      create_datetime: string,
      update_datetime: string,
      job_type_id: number,
      job_type_name: string
    } ]
  }
}

// interface for a job object
interface Job {
  jobs_id: number,
  job_title: string,
  company_name: string,
  link: string,
  notes: string,
  attachments: string,
  user_id: number,
  create_datetime: string,
  update_datetime: string,
  job_type_id: number,
  job_type_name: string
}

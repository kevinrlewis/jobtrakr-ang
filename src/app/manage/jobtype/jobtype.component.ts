import { Component, OnInit, Input, HostListener, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of, forkJoin, combineLatest, empty } from 'rxjs';
import { filter, map, merge, switchMap, pairwise, catchError,
  concat, mergeAll, combineAll, zip, concatAll, share, shareReplay,
  toArray } from 'rxjs/operators';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group
} from '@angular/animations';

import { ManageService } from './../../manage.service';

import { Job } from './../../../models/job.model';
import { User } from './../../../models/user.model';

// icons
import {
  faTimes,
  faExternalLinkSquareAlt,
  faExternalLinkAlt,
  faEdit,
  faCog,
  faFileDownload,
  faPlus,
  faAngleLeft,
  faAngleRight,
  faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

const jobTypeArr = ['opportunities', 'applied', 'interviews', 'offers', 'archive'];
const jobTypeActionArr = ['opportunity', 'applied', 'interviews', 'offers', 'archive'];
const jobIdMap = { 'opportunity': 1, 'applied': 2, 'interview': 3, 'offer': 4, 'archive': 5 };
const jobIdToNameMap = { 1: 'opportunity', 2: 'applied', 3: 'interview', 4: 'offer', 5: 'archive' };

/*
  modify titles and descriptions here or add dynamic fields
  dependent on the job type
*/
const jobTypeMap = {
  1: {
    job_type_name: 'opportunity',
    title: 'Opportunities',
    description: 'Store jobs that you wish to apply to or plan to apply to here.',
    button_desc: "I've Found An Opportunity"
  },
  2: {
    job_type_name: 'applied',
    title: 'Applied',
    description: 'Once you have applied to a job, move the applied job here or add it.',
    button_desc: "I've Applied"
  },
  3: {
    job_type_name: 'interview',
    title: 'Interviews',
    description: 'As you start interviewing for jobs, add or move them here to track your progression.',
    button_desc: "I'm Interviewing"
  },
  4: {
    job_type_name: 'offer',
    title: 'Offers',
    description: 'Once you have received some form of offer, add or move the job here.',
    button_desc: "I've Received An Offer"
  },
  5: {
    job_type_name: 'archive',
    title: 'Archived',
    description: 'This is where the jobs you have archived or no longer need to track go.',
    button_desc: "I'm Archived"
  }
};

@Component({
  selector: 'app-jobtype',
  templateUrl: './jobtype.component.html',
  styleUrls: ['./jobtype.component.css'],
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
        animate('1s')
      ]),
      transition('closed => open', [
        animate('1s')
      ]),
    ]),
    trigger('slideDown', [
      state('up', style({
        'max-height': '0px',
        'opacity': '0',
        // 'visibility': 'hidden'
        'display': 'none'
      })),
      state('down', style({
        'max-height': '500px',
        'opacity': '1',
        // 'visibility': 'visible'
        'display': 'block'
      })),
      transition('down => up', [
        // style({height: '*'}),
        animate('300ms')
      ]),
      transition('up => down', [
        // style({height: '0px'}),
        animate('300ms')
      ])
    ])
  ]
})
export class JobtypeComponent implements OnInit, AfterViewInit, OnDestroy {
  // states that control the animations
  state:string = 'closed';
  addJobState:string = 'up';

  // variables retrieved from parent component
  // user information retrieved from the parent component
  @Input() user: User;
  // job type retrieved from the parent component
  @Input() jobType: number;
  // variable for job type counts
  @Input() jobTypeCounts: [];

  // initialize the jobTypeMap constant as part of this component
  jobTypeMap = jobTypeMap;
  jobFragmentsToIdMap = { 'opportunities': 1, 'applied': 2, 'interviews': 3, 'offers': 4, 'archive': 5 };
  jobNameToIdMap = { 'opportunity': 1, 'applied': 2, 'interview': 3, 'offer': 4, 'archive': 5 };
  jobIdToNameMap = { 1: 'opportunity', 2: 'applied', 3: 'interview', 4: 'offer', 5: 'archive' };

  jobTypeArr = jobTypeArr;

  // font awesome icons
  faTimes = faTimes;
  faExternalLinkAlt = faExternalLinkAlt;
  faExternalLinkSquareAlt = faExternalLinkSquareAlt;
  faEdit = faEdit;
  faCog = faCog;
  faFileDownload = faFileDownload;
  faPlus = faPlus;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faCloudUploadAlt = faCloudUploadAlt;

  // form variables
  addForm: FormGroup;
  pocs: FormArray;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  files: string;

  // store token
  token: string;

  // array to hold ids for files that need to be attached to a job
  filesArray: string[];

  // arrays/observables to display jobs
  @Input() jobsArray: Job[] = [];
  @Input() jobsObservable: Observable<Array<Job>>;

  // display toggles
  displayAddForm = false;
  @Input() displaySettings = false;
  @Input() displayEdit = false;

  // reaction messages
  validationMessage = [];
  displayMessage: boolean = false;
  displayDeleteSuccessMessage: boolean = false;
  displayDeleteFailureMessage: boolean = false;

  // current job to edit
  jobToEdit: Job = null;
  @Input() updatedJob: Job = null;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private http: HttpClient,
    private manage: ManageService,
    private activatedRoute: ActivatedRoute,
    private change: ChangeDetectorRef
  ) {
    // intialize animation state variables
    this.state = 'closed';
    this.addJobState = 'up';
  }

  ngOnInit() {
    // get token
    this.token = this.cookieService.get('SESSIONID');

    // initialize add form
    this.addForm = this.fb.group({
      'companyName': [this.companyName, [Validators.required, Validators.maxLength(128)]],
      'jobTitle': [this.jobTitle, [Validators.required, Validators.maxLength(64)]],
      'link': [this.link, [Validators.required, Validators.maxLength(512)]],
      'notes': [this.notes, [Validators.maxLength(128)]],
      'files': [this.files, []],
      'pocs': this.fb.array([])
    });

    // determine the fragment
    this.activatedRoute.fragment.subscribe( fragment => {
      this.jobType = this.jobFragmentsToIdMap[fragment];
      // get all user jobs to display
      this.getJobs();
    });
  }

  // handle changes when page is initialized
  ngAfterViewInit() {
    this.state = 'open';
    this.change.detectChanges();
    document.querySelector('body').classList.add('white-background');
  }

  ngOnDestroy() {
    document.querySelector('body').classList.remove('white-background');
  }

  /*
    create contact form
  */
  createPoc(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(32)]],
      title: ['', [Validators.maxLength(64)]],
      email: ['', [Validators.email, Validators.maxLength(64)]],
      phone: ['', [Validators.maxLength(64)]],
      notes: ['', [Validators.maxLength(128)]]
    });
  }

  /*
    when multiple contact forms are desired
  */
  addPocForm(): void {
    this.pocs = this.addForm.get('pocs') as FormArray;
    this.pocs.push(this.createPoc());
  }

  /*
    retrieve the emit from the child component to close the settings box
  */
  settingsClose(val: boolean) {
    // console.log('parent closing settings...');
    this.displaySettings = val;
  }

  /*
    when the add form is submitted
    attempt to call the api to add the data
  */
  onAddSubmit() {
    // validate form
    var validated = this.validateAddForm(this.addForm);

    if(validated.status) {

      console.log(this.addForm.value);

      // check if any files are attached
      // if so then create the string to pass to db
      var temp = this.manage.formatFileNamePayload(this.filesArray);
      // console.log('formatFileNamePayload:', temp);

      // create the body to be sent
      var body = this.addForm.value;
      body.type = this.jobIdToNameMap[this.jobType];
      body.userId = this.user.user_id;
      body.files = temp;

      // console.log(JSON.stringify(body));
      // get the response of add a new job
      // convert the returned job to an array to merge
      var responseObservable = this.manage.addJob(
        JSON.stringify(body)
      ).pipe(
        map(({ data }) => {
          // console.log(data);
          return data;
        }),
        switchMap((insert_job) => {
          let insert_job_arr: Job[] = [insert_job];
          let insert_job_arr_observable: Observable<Array<Job>> = of(insert_job_arr);
          return insert_job_arr_observable;
        })
      );

      // merge the new job in with the current jobs
      this.jobsObservable = forkJoin(this.jobsObservable, responseObservable)
        .pipe(
          map(([a1, a2]) => {
            // console.log('a1:', a1);
            // console.log('a2:', a2);
            a1 = (a1 === null) ? [] : a1;
            a2 = (a2 === null) ? [] : a2;
            var tempSet = new Set([...a1, ...a2]);
            return Array.from(tempSet);
          }),
          shareReplay(1)
        );

      // hide the add form
      this.displayAddForm = false;
    } else {
      this.displayMessage = true;
      this.validationMessage = validated.message;
    }
  }

  // update the observable with the new observable of jobs
  onObservableUpdate(jobs: Observable<Array<Job>>) {
    this.jobsObservable = jobs;
  }

  /*
    listen to changes to the file input tag
    upload files that are attached and store their location
    in order to associate the files to a specific job
  */
  onFileChange(event) {
    // save the file with the specific job type
    this.filesArray = this.manage.saveFile(event, 2);

    // console.log('onFileChange:', this.filesArray);s
  }

  /*
    helper function to get the array of jobs
  */
  getJobs() {
    // TODO: catch errors
    // call api to get jobs, filter by job type
    this.jobsObservable = this.manage.getJobs(this.user.user_id)
      .pipe(
        map(({ data }) => { return data;}),
        map(jobs => (jobs != null) ? jobs.filter(job => job.job_type_id === this.jobType) : null)
      );
  }

  /*
    when the user clicks the x button, navigate back to the manage component
  */
  close() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
    this.resetAddForm();
  }

  /*
    helper function to toggle the add form to display and not display
  */
  toggleAddForm() {
    this.displayAddForm = !this.displayAddForm;
    this.addJobState = (this.addJobState === 'up') ? 'down' : 'up';

    // if the form is already being display, close should reset the values
    if(this.displayAddForm) {
      this.resetAddForm();
    }
  }

  /*
    helper function to toggle the settings display
  */
  toggleSettings() {
    this.jobsObservable.subscribe(data => {
      this.jobsArray = data;
      this.displaySettings = !this.displaySettings;
    });
  }

  /*
    validate the add form
  */
  validateAddForm(l:FormGroup) {
    // variables to return
    let messageList: Array<string> = [];
    let status: boolean = true;

    // check if the job title is invalid
    if (l.get('jobTitle').invalid) {
      status = false;
      messageList.push('Job title invalid.');
    }

    // check if the company name is invalid
    if (l.get('companyName').invalid) {
      status = false;
      messageList.push('Company name invalid.');
    }

    // check if link is a valid link
    if(!this.manage.isValidUrl(l.get('link').value) || l.get('link').invalid) {
      status = false;
      messageList.push('Link invalid.');
    }

    // check contacts validity
    var contacts = this.addForm.get("pocs") as FormArray;
    // iterate contacts controls
    contacts.controls.forEach((fg: FormGroup) => {
      // access FormControls of the object
      Object.keys(fg.controls).forEach(field => {
        // check if field is invalid
        if(fg.controls[field].invalid) {
          status = false;
          messageList.push('Contact ' + field + ' invalid.');
        }
      });
    });

    // return object
    return { status: status, message: messageList };
  }

  /*
    reset the values of the add form
  */
  resetAddForm() {
    this.addForm.reset();
    this.validationMessage = [];
    this.displayMessage = false;
  }

  /*
    get a file from s3 to download
  */
  getFile(file_path, original_name) {
    // get path of the url
    var l = document.createElement("a");
    l.href = file_path;

    // get the pre signed url by passing the url without the initial slash
    var url = this.manage.getAttachment(l.pathname.substring(1), original_name);

    // open file in new tab (should download it)
    window.open(url);
  }

  /*
    when the user clicks the edit button on a specific job
  */
  onClickEdit(index: number) {
    this.jobsObservable.subscribe(data => {
      // console.log('editting...', index);
      this.jobsArray = data;
      this.displayEdit = true;
      this.jobToEdit = this.jobsArray[index];
    });
  }

  /*
    when the user clicks the delete button on a specific job
  */
  onClickDelete(job: Job) {
    this.displayDeleteFailureMessage = false;
    this.displayDeleteSuccessMessage = false;
    // console.log('deleting...', job);
    // call function in manage service to grab jobs based on job type and user id
    this.manage.deleteJob(job.user_id, job.jobs_id).subscribe(data => {
      // console.log(data);
      this.displayDeleteSuccessMessage = true;
    },
    // TODO: display message if there was an error retrieving jobs
    error => {
      // console.log(error);
      this.displayDeleteFailureMessage = true;
    });

    // filter out deleted value
    this.jobsObservable = this.jobsObservable.pipe(
      map(jobs => { return jobs.filter(j => j.jobs_id !== job.jobs_id); })
    );
  }

  /*
    function to move a job to a different job type without using the manage grid
  */
  onClickMove(desiredJobType: number, jobsId: number) {
    console.log(this.user);
    this.manage.updateJobType(this.user.user_id, jobsId, desiredJobType)
      .subscribe(data => {
        console.log(data);
        // filter out the moved value
        this.jobsObservable = this.jobsObservable.pipe(
          map(jobs => { return jobs.filter(j => j.jobs_id !== jobsId); })
        );
      });
  }

}

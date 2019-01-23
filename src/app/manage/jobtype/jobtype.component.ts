import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ManageService } from './../../manage.service';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

import { Job } from './../../../models/job.model';
import { User } from './../../../models/user.model';

// icons
import {
  faTimes,
  faExternalLinkSquareAlt,
  faExternalLinkAlt,
  faEdit,
  faCog,
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

/*
  modify titles and descriptions here or add dynamic fields
  dependent on the job type
*/
const jobTypeMap = {
  1: {
    job_type_name: 'opportunity',
    title: 'Opportunities',
    description: 'Store jobs that you wish to apply to or plan to apply to here.'
  },
  2: {
    job_type_name: 'applied',
    title: 'Applied',
    description: 'Once you have applied to a job, move the applied job here or add it.'
  },
  3: {
    job_type_name: 'interview',
    title: 'Interviews',
    description: 'As you start interviewing for jobs, add or move them here to track your progression.'
  },
  4: {
    job_type_name: 'offer',
    title: 'Offers',
    description: 'Once you have received some form of offer, add or move the job here.'
  }
};

@Component({
  selector: 'app-jobtype',
  templateUrl: './jobtype.component.html',
  styleUrls: ['./jobtype.component.css']
})
export class JobtypeComponent implements OnInit {

  // user information retrieved from the parent component
  @Input() user: User;

  // job type retrieved from the parent component
  @Input() jobType: number;

  // initialize the jobTypeMap constant as part of this component
  jobTypeMap = jobTypeMap;
  jobNameToIdMap = { 'opportunity': 1, 'applied': 2, 'interview': 3, 'offer': 4 };
  jobIdToNameMap = { 1: 'opportunity', 2: 'applied', 3: 'interview', 4: 'offer' };

  // font awesome icons
  faTimes = faTimes;
  faExternalLinkAlt = faExternalLinkAlt;
  faExternalLinkSquareAlt = faExternalLinkSquareAlt;
  faEdit = faEdit;
  faCog = faCog;
  faFileDownload = faFileDownload;

  // form variables
  addForm: FormGroup;
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
  jobsObservable: Observable<Array<Job>>;

  // display toggles
  displayAddForm = false;
  @Input() displaySettings = false;
  @Input() displayEdit = false;

  // error messages during the add job process
  validationMessage = [];
  displayMessage: boolean;

  // current job to edit
  jobToEdit: Job = null;
  @Input() updatedJob: Job = null;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private http: HttpClient,
    private manage: ManageService,
    private logger: NGXLogger
  ) {
    // initialize the observable to watch the jobsArray
    this.jobsObservable = of(this.jobsArray);
  }

  ngOnInit() {
    // get token
    this.token = this.cookieService.get('SESSIONID');

    // initialize add form
    this.addForm = this.fb.group({
      'companyName': [this.companyName, [Validators.required]],
      'jobTitle': [this.jobTitle, [Validators.required]],
      'link': [this.link, [Validators.required]],
      'notes': [this.notes, []],
      'files': [this.files, []],
    });

    // get all user jobs to display
    this.getJobs();
  }

  /*
    retrieve the emit from the child component to close the settings box
  */
  settingsClose(val: boolean) {
    console.log('parent closing settings...');
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
      // check if any files are attached
      // if so then create the string to pass to db
      var temp = this.manage.formatFileNamePayload(this.filesArray);

      // call api to post a job
      this.manage.addJob(
        this.addForm.get('companyName').value,
        this.addForm.get('jobTitle').value,
        this.addForm.get('link').value,
        this.addForm.get('notes').value,
        this.jobIdToNameMap[this.jobType],
        temp,
        this.user.user_id
      ).subscribe(data => {
        // add job to observable
        if(data.data.insert_job.job_type_id === this.jobType) {
          this.jobsArray.push(data.data.insert_job);
        }

        // close add form
        this.displayAddForm = false;
      }, error => {
        console.log(error);
        // display error
      });
    } else {
      this.displayMessage = true;
      this.validationMessage = validated.message;
    }
  }

  /*
    listen to changes to the file input tag
    upload files that are attached and store their location
    in order to associate the files to a specific job
  */
  onFileChange(event) {
    // save the file with the specific job type
    this.filesArray = this.manage.saveFile(event, 2);
  }

  /*
    helper function to get the array of jobs
  */
  getJobs() {
    // call function in manage service to grab jobs based on job type and user id
    this.manage.getJobs(this.user.user_id).subscribe(
      data => {
        if(data.data.get_jobs_by_user_id !== null) {
          data.data.get_jobs_by_user_id.forEach(job => {
            if(job.job_type_id === this.jobType) {
              // if the job is part of this job type then store it to be
              // displayed
              this.jobsArray.push(job);
            }
          });
        }
        return;
      },
      // TODO: display message if there was an error retrieving jobs
      error => {
        console.log(error);
      }
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
    // if the form is already being display, close should reset the values
    if(this.displayAddForm) {
      this.resetAddForm();
    }
  }

  /*
    helper function to toggle the settings display
  */
  toggleSettings() {
    this.displaySettings = !this.displaySettings;
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

    // return object
    return { status: status, message: messageList };
  }

  /*
    reset the values of the add form
  */
  resetAddForm() {
    this.addForm.reset();
  }

  /*
    get a file from s3 to download
  */
  getFile(file_path) {
    // get path of the url
    var l = document.createElement("a");
    l.href = file_path;

    // get the pre signed url by passing the url without the initial slash
    var url = this.manage.getAttachment(l.pathname.substring(1));

    // open file in new tab (should download it)
    window.open(url);
  }

  /**/
  onClickEdit(job: Job) {
    console.log('editting...', job);
    this.displayEdit = true;
    this.jobToEdit = job;
  }

  /**/
  onClickDelete(job: Job) {
    console.log('deleting...', job);
    // call function in manage service to grab jobs based on job type and user id
    this.manage.deleteJob(job.user_id, job.jobs_id).subscribe(
      data => {
        console.log(data);
        var arrLength = this.jobsArray.length;

        // remove job from array
        for(var i = 0; i < arrLength; i++) {
          if(this.jobsArray[i].jobs_id === job.jobs_id) {
            this.jobsArray.splice(i, 1);
          }
        }
      },
      // TODO: display message if there was an error retrieving jobs
      error => {
        console.log(error);
      }
    );
  }

}

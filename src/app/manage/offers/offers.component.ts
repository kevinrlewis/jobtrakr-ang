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

import { faTimes } from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

const JOB_TYPE = 4;
const JOB_TYPE_NAME = 'offer';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {

  // get user data from parent component
  @Input() user: {
    user_id: number,
    email: string,
    firstname: string,
    lastname: string,
    bio: string,
    profile_image: string,
    share_applied: boolean,
    share_interviews: boolean,
    share_offers: boolean,
    share_opportunities: boolean,
    update_datetime: string
  };

  // font awesome icons
  faTimes = faTimes;

  // form
  addOfferForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  offerFiles: string;

  // store token
  token: string;

  // array to hold ids for files that need to be attached to a job
  filesArray: string[];

  // array to hold jobs interviewing, pulled from api
  jobsArray: object[];

  offersArray: Job[] = [];
  offersObservable: Observable<Array<Job>>

  // display toggles
  displayAddForm = false;

  validationMessage = [];
  displayMessage:boolean;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private http: HttpClient,
    public manage: ManageService
  ) {
    this.offersObservable = of(this.offersArray);
  }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');

    // initialize add interview form
    this.addOfferForm = this.fb.group({
      'companyName': [this.companyName, [Validators.required]],
      'jobTitle': [this.jobTitle, [Validators.required]],
      'link': [this.link, [Validators.required]],
      'notes': [this.notes, []],
      'offerFiles': [this.offerFiles, []],
    });

    // get all user offers to display
    this.getJobs();
  }

  onAddSubmit() {
    // validate form
    var validated = this.validateAddForm(this.addOfferForm);

    if(validated.status) {
      // check if any files are attached
      // if so then create the string to pass to db
      var temp = this.manage.formatFileNamePayload(this.filesArray);
      console.log("FILES TO ATTACH:", temp);

      // call api to post a job
      this.manage.addJob(
        this.addOfferForm.get('companyName').value,
        this.addOfferForm.get('jobTitle').value,
        this.addOfferForm.get('link').value,
        this.addOfferForm.get('notes').value,
        JOB_TYPE_NAME,
        temp,
        this.user.user_id
      ).subscribe(data => {
        console.log(data);
        // close add form
      }, error => {
        console.log(error);
        // TODO: display error
      });
    } else {
      this.displayMessage = true;
      this.validationMessage = validated.message;
    }
  }

  onFileChange(event) {
    // save file with type 3 (interview)
    this.filesArray = this.manage.saveFile(event, JOB_TYPE);
  }

  getJobs() {
    // this.http.get<GetJobsResponse>(
    //   '/api/job/' + JOB_TYPE_NAME + '/id/' + this.user.user_id,
    //   httpOptions
    // )
    this.manage.getJobs(this.user.user_id).subscribe(
      data => {
        console.log(data.data);
        data.data.get_jobs_by_user_id.forEach(job => {
          if(job.job_type_id === JOB_TYPE) {
            this.offersArray.push(job);
          }
          // this.jobsArray.push(job);
        });
        return;
      },
      // TODO: display message if there was an error retrieving opportunities
      error => {
        console.log(error);
      }
    );
  }

  close() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

  // helper function to toggle the add opportunity form to display and not display
  toggleAddForm() {
    this.displayAddForm = !this.displayAddForm;
    // if the form is already being display, close should reset the values
    if(this.displayAddForm) {
      this.resetAddForm();
    }
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

  resetAddForm() {
    // reset form
    this.addOfferForm.reset();
  }
}

interface Job {
  jobs_id: number,
  job_title: string,
  company_name: string,
  link: string,
  notes: string,
  attachments: string[],
  user_id: number,
  create_datetime: string,
  update_datetime: string,
  job_type_id: number
}

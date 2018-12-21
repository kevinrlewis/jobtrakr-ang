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

// icons
import {
  faTimes,
  faExternalLinkSquareAlt,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

const JOB_TYPE = 1;
const JOB_TYPE_NAME = 'opportunity';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.component.html',
  styleUrls: ['./opportunities.component.css']
})
export class OpportunitiesComponent implements OnInit {

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
  faExternalLinkAlt = faExternalLinkAlt;
  faExternalLinkSquareAlt = faExternalLinkSquareAlt;

  // form variables
  addOpportunityForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  opportunitiesFiles: string;

  // store token
  token: string;

  // array to hold ids for files that need to be attached to a job
  filesArray: string[];

  // array to hold existing opportunities, pulled from api
  jobsArray: object[];

  opportunitiesArray: Job[] = [];
  opportunitiesObservable: Observable<Array<Job>>;

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
    router.events.subscribe((val) => {
        // document.body.style.background = 'rgb(54, 73, 78, 1)';
        // document.body.style.background = 'url(\'../../../assets/buttons/btn1.jpg\') no-repeat center center fixed';
        // document.body.style.backgroundSize = 'cover';
        // document.body.style.height = '100%';
    });

    this.opportunitiesObservable = of(this.opportunitiesArray);
  }

  // initialization function, when the component is refreshed/initialized
  ngOnInit() {
    // get token
    this.token = this.cookieService.get('SESSIONID');

    // initialize add opportunity form
    this.addOpportunityForm = this.fb.group({
      'companyName': [this.companyName, [Validators.required]],
      'jobTitle': [this.jobTitle, [Validators.required]],
      'link': [this.link, [Validators.required]],
      'notes': [this.notes, []],
      'opportunitiesFiles': [this.opportunitiesFiles, []],
    });

    // get all user opportunities to display
    this.getJobs();
  }

  /*
    when the add opportunity form is submitted
    attempt to call the api to add the data
  */
  onAddSubmit() {
    // validate form
    // console.log(this.loginForm.value);
    var validated = this.validateAddForm(this.addOpportunityForm);


    if(validated.status) {
      // check if any files are attached
      // if so then create the string to pass to db
      var temp = this.manage.formatFileNamePayload(this.filesArray);
      console.log("FILES TO ATTACH:", temp);

      // call api to post a job
      this.manage.addJob(
        this.addOpportunityForm.get('companyName').value,
        this.addOpportunityForm.get('jobTitle').value,
        this.addOpportunityForm.get('link').value,
        this.addOpportunityForm.get('notes').value,
        JOB_TYPE_NAME,
        temp,
        this.user.user_id
      ).subscribe(data => {
        console.log(data);
        // close add form
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
    in order to associate the files to a specific job opportunity
  */
  onFileChange(event) {
    // save file with type 1 (opportunity)
    this.filesArray = this.manage.saveFile(event, JOB_TYPE);
  }

  /*
    helper function to get the array of opportunities
  */
  getJobs() {
    // call function in manage service to grab jobs based on job type and user id
    this.manage.getJobs(this.user.user_id).subscribe(
      data => {
        if(data.data.get_jobs_by_user_id !== null) {
          data.data.get_jobs_by_user_id.forEach(job => {
            if(job.job_type_id === JOB_TYPE) {
              this.opportunitiesArray.push(job);
            }
            // this.jobsArray.push(job);
          });
        }
        return;
      },
      // TODO: display message if there was an error retrieving opportunities
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
    helper function to toggle the add opportunity form to display and not display
  */
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

  /*
    reset the values of the add opportunity form
  */
  resetAddForm() {
    this.addOpportunityForm.reset();
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
}

// job interfaces
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

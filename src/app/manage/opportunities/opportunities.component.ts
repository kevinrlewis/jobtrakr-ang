import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

// icons
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Credentials': 'true'
  }),
  // withCredentials: true,
  // credentials: 'include'
};

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

  // form variables
  addOpportunityForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  opportunitiesFiles: string;

  // store token
  token: string;

  // array to hold ids for files that need to be attached to an opportunity
  filesArray: string[];

  // array to hold opportunities
  opportunitiesArray: object[];

  // display toggles
  displayAddForm = false;;

  constructor(private router: Router, private cookieService: CookieService, private fb: FormBuilder, private http: HttpClient) {
    router.events.subscribe((val) => {
        // document.body.style.background = 'rgb(54, 73, 78, 1)';
        // document.body.style.background = 'url(\'../../../assets/buttons/btn1.jpg\') no-repeat center center fixed';
        // document.body.style.backgroundSize = 'cover';
        // document.body.style.height = '100%';
    });
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
    this.getOpportunities();
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
      var temp = null;
      if(this.filesArray !== undefined) {
        temp = '{';
        // iterate if there are multiple files
        for(var i = 0; i < this.filesArray.length; i++) {
          temp += '"' + this.filesArray[i] + '",'
        }
        // don't include the trailing comma
        temp = temp.substring(0, temp.length - 1) + '}';
      }

      console.log(temp);

      // call api to post a job
      this.http.post<AddJobResponse>(
        '/api/job',
        {
          'company_name': this.addOpportunityForm.get('companyName').value,
          'job_title': this.addOpportunityForm.get('jobTitle').value,
          'link': this.addOpportunityForm.get('link').value,
          'notes': this.addOpportunityForm.get('notes').value,
          'type': 'opportunity',
          'attachments': temp,
          'user_id': this.user.user_id
        },
        httpOptions
      ).subscribe(data => {
        console.log(data);
        // close add form
      }, error => {
        console.log(error);
        // display error
      });
    }
  }

  /*
    listen to changes to the file input tag
    upload files that are attached and store their location
    in order to associate the files to a specific job opportunity
  */
  onFileChange(event) {
    this.filesArray = [];
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        // 'Access-Control-Allow-Credentials': 'true'
      }),
    };

    // let reader = new FileReader();
    console.log(event.target.files);
    var filesArray = event.target.files;
    for(var i = 0; i < filesArray.length; i++) {
      let formData: FormData = new FormData();
      var file = filesArray[i];
      console.log("FILE:", file);
      formData.append('files', file);

      this.http.post<UploadResponse>(
        'api/upload',
        formData
      )
        .subscribe(data => {
          console.log("UPLOAD DATA:", data);
          // save the file to be attached to an opportunity
          this.filesArray.push(data.file);
        });
    }
  }

  /*
    helper function to get the array of opportunities
  */
  getOpportunities() {
    this.http.get<GetOpportunitiesResponse>(
      '/api/job/opportunity/id/' + this.user.user_id,
      httpOptions
    ).subscribe(data => {
      console.log(data.data);
      this.opportunitiesArray = data.data.get_opportunities_by_user_id;
      return;
    // TODO: display message if there was an error retrieving opportunities
    }, error => {
      console.log(error);
    });
  }


  // when the user clicks the x button, navigate back to the manage component
  close() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
    this.resetAddForm();
  }

  // helper function to toggle the add opportunity form to display and not display
  toggleAddForm() {
    this.displayAddForm = !this.displayAddForm;
    // if the form is already being display, close should reset the values
    if(this.displayAddForm) {
      this.resetAddForm();
    }
  }

  // validate the add form
  validateAddForm(l:FormGroup) {
    // variables to return
    let messageList: Array<string> = [];
    let status: boolean = true;

    // // check if the email is invalid
    // if (l.get('email').invalid) {
    //   status = false;
    //   messageList.push('Email invalid.');
    // }
    //
    // // check if password is invalid
    // if (l.get('password').invalid) {
    //   status = false;
    //   messageList.push('Password invalid.');
    // }

    // return object
    return { status: status, message: messageList };
  }

  // reset the values of the add opportunity form
  resetAddForm() {
    this.addOpportunityForm.reset();
  }
}

// interface to get an expected response from the api
// when we call the upload endpoint
export interface UploadResponse {
  message: string,
  file: string
}

// interface to get an expected response from the api
// when we call the add job endpoint
export interface AddJobResponse {
  message: string
}

// interface to get an expected response from the api
// when we call the api to get all opportunities
export interface GetOpportunitiesResponse {
  message: string,
  data: {
    get_opportunities_by_user_id: [
      {
        jobs_id: number,
        job_title: string,
        company_name: string,
        link: string,
        notes: string,
        attachments: string[],
        active: boolean,
        job_type_id: number,
        user_id: number,
        create_datetime: string,
        update_datetime: string
      }
    ]
  }
}

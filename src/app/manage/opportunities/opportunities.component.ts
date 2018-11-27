import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

// icons
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.component.html',
  styleUrls: ['./opportunities.component.css']
})
export class OpportunitiesComponent implements OnInit {

  faTimes = faTimes;

  addOpportunityForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  opportunities_files: string;

  token: string;

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



  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
    this.addOpportunityForm = this.fb.group({
      'companyname': [this.companyName, [Validators.required]],
      'jobtitle': [this.jobTitle, [Validators.required]],
      'link': [this.link, [Validators.required]],
      'notes': [this.notes, []],
      'opportunitiesFiles': [this.opportunities_files, []],
    });
  }

  onAddSubmit() {
    // validate form
    // console.log(this.loginForm.value);
    var validated = this.validateAddForm(this.addOpportunityForm);


    if(validated.status) {
      // call function to push job to array / new array
      // on page refresh / page change the new array should be pushed to the database
      // or an asynchronous call should be made to send the job to the database while
      // also showing it on the website
      console.log(this.addOpportunityForm);
    }
  }

  onFileChange(event) {
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
      formData.append('files', file);

      this.http.post<UploadResponse>(
        'api/upload',
        formData
      )
        .subscribe(data => {
          console.log("UPLOAD DATA:", data);
        });
    }
  }

  // when the user clicks the x button, navigate back to the manage component
  close() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

  toggleAddForm() {
    this.displayAddForm = !this.displayAddForm;
  }

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

}

export interface UploadResponse {
  message: string
}

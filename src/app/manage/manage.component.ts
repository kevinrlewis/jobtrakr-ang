import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
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

  opportunities_active: boolean;
  applied_active: boolean;
  interviews_active: boolean;
  offers_active: boolean;
  show_buttons: boolean;
  show_grid: boolean;

  jobsArray: object[] = [];
  opportunitiesArray: object[] = [];
  appliedArray: object[] = [];
  interviewArray: object[] = [];
  offerArray: object[] = [];

  droppedData: string;

  token: string;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.id = this.email = this.firstname = this.lastname = "";

    router.events.subscribe((val) => {
        document.body.style.background = 'rgb(255, 255, 255, 1)';
        // document.body.style.background = 'url(\'../../assets/mountains.jpg\') no-repeat center center fixed';
        // document.body.style.backgroundSize = 'cover';
        // document.body.style.height = '100%';
    });
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
        // this.show_buttons = true;
        // this.show_grid = false;

        // testing grid
        this.show_buttons = false;
        this.show_grid = true;
      }
    });

    this.id = jwt_decode(this.token).sub.toString();

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

    this.http.get<GetJobsResponse>(
      '/api/job/id/' + this.id,
      httpOptions
    ).subscribe(data => {
      console.log(data);
      this.jobsArray = data.data.get_jobs_by_user_id;
      var temp = data.data.get_jobs_by_user_id;

      for(var i = 0; i < temp.length; i++) {
        if(temp[i].job_type_id === 1) {
          this.opportunitiesArray.push(this.jobsArray[i]);
        } else if(temp[i].job_type_id === 2) {
          this.appliedArray.push(this.jobsArray[i]);
        } else if(temp[i].job_type_id === 3) {
          this.interviewArray.push(this.jobsArray[i]);
        } else if(temp[i].job_type_id === 4) {
          this.offerArray.push(this.jobsArray[i]);
        }
      }

    });
  }

  setInitVariables() {
    this.opportunities_active = false;
    this.applied_active = false;
    this.interviews_active = false;
    this.offers_active = false;
  }

  onJobDrop(event): void {
    console.log(event);
    // this.droppedData = dropData;
    // setTimeout(() => {
    //   this.droppedData = '';
    // }, 2000);
  }

  toggleOpportunitiesActive() {
    this.opportunities_active = !this.opportunities_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'opportunities' });
  }

  toggleAppliedActive() {
    this.applied_active = !this.applied_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'applied' });
  }

  toggleInterviewsActive() {
    this.interviews_active = !this.interviews_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'interviews' });
  }

  toggleOffersActive() {
    this.offers_active = !this.offers_active;
    this.show_buttons = false;
    this.router.navigate([this.router.url], { fragment: 'offers' });
  }

  isSubComponentActive() {
    // console.log('isSubComponentActive: ', (this.opportunities_active || this.applied_active || this.interviews_active || this.offers_active));
    return (this.opportunities_active || this.applied_active || this.interviews_active || this.offers_active);
  }

  settingsClicked() {
    this.router.navigate(['profile/' + jwt_decode(this.token).sub]);
  }

  selectGrid() {
    this.show_buttons = false;
    this.show_grid = true;
  }

  selectButtons() {
    this.show_grid = false;
    this.show_buttons = true;
  }
}

interface GetUserResponse {
  message: string,
  data: {
    user_id: number,
    email: string,
    firstname: string,
    lastname: string
  }
}

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

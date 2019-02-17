import { Component, OnInit, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// icons
import {
  faCheck
} from '@fortawesome/free-solid-svg-icons';

import { ManageService } from './../../../manage.service';
import { Job } from './../../../../models/job.model';
import { User } from './../../../../models/user.model';

@Component({
  selector: 'app-jobtype-settings',
  templateUrl: './jobtype-settings.component.html',
  styleUrls: ['./jobtype-settings.component.css']
})
export class JobtypeSettingsComponent implements OnInit {

  // what we want to receive from the parent component
  @Input() jobsArray: Job[];
  @Input() displaySettings: boolean;
  @Input() user: User;

  // what we want to relay the parent component
  @Output() displaySettingsChange = new EventEmitter<boolean>();
  @Output() jobsArrayUpdate = new EventEmitter<Observable<Array<Job>>>();
  jobsObservable: Observable<Array<Job>>;

  // font awesome icons
  faCheck = faCheck;

  // form group
  updateForm: FormGroup;

  // boolean to control displaying an error message
  displayMessage: boolean;
  message: string;

  constructor(
    private fb: FormBuilder,
    private manage: ManageService
  ) {

  }

  ngOnInit() {
    // initialize jobIds for the form
    const jobIds = this.jobsArray.map(j => new FormControl(false));

    // initialize update form
    this.updateForm = this.fb.group({
      jobs: new FormArray(jobIds)
    });
  }

  /*
    handle closing the settings box
  */
  close(event) {
    // determine if the click was within the settings box
    if(event.target.closest('.jobtype-settings')) {
      // if click was within box then continue displaying settings
      this.displaySettingsChange.emit(true);
    } else {
      // if click was outside the box then close the display settings
      this.displaySettingsChange.emit(false);
    }
  }

  get formData() {
    return (<FormArray>this.updateForm.controls['jobs']);
  }

  /*
    close the settings component
  */
  forceClose() {
    this.displaySettingsChange.emit(false);
  }

  /*
    function called when the updateForm has been submitted
  */
  updateFormSubmit() {
    const selectedJobs = this.updateForm.value.jobs
      .map((v, i) => v ? this.jobsArray[i].jobs_id : null)
      .filter(v => v !== null);

    // delete jobs by calling the api
    this.manage.deleteJobs(
      this.user.user_id,
      selectedJobs
    ).subscribe(data => {
      console.log(data);
      console.log(selectedJobs);
      // iterate jobsArray for jobs to remove
      let len = this.jobsArray.length;
      for(var i = len - 1; i >= 0; i--) {
        // if job should be removed then remove it
        if(selectedJobs.includes(this.jobsArray[i].jobs_id)) {
          this.jobsArray.splice(i, 1);
        }
      }

      this.jobsObservable = of(this.jobsArray);

      // emit to parent the updated jobsArray
      // this.jobsArrayUpdate.emit(of(this.jobsArray));

      // close settings
      this.forceClose();
    }, error => {
      console.log(error);
      // display error
      this.message = 'Error bulk updating jobs, please retry.';
      this.displayMessage = true;
    });
  }

}

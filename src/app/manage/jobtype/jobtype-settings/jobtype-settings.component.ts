import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';

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

  // observables
  jobsObservable: Observable<Array<Job>>;

  // font awesome icons
  faCheck = faCheck;

  // form group
  updateForm: FormGroup;

  // boolean to control displaying an error message
  displayMessage: boolean;
  message: string;

  // boolean to hold the value of the all checkbox
  isAllChecked: boolean = false;

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

  // getter to retrieve update form data
  get formData() {
    return (<FormArray>this.updateForm.controls['jobs']);
  }

  /*
    close the settings component
  */
  forceClose() {
    this.displaySettingsChange.emit(false);
  }

  allClick(e) {
    this.isAllChecked = e.target.checked;
  }

  /*
    function called when the updateForm has been submitted
  */
  updateFormSubmit() {
    var selectedJobs;
    if(this.isAllChecked) {
      selectedJobs = this.updateForm.value.jobs
        .map((v, i) => this.jobsArray[i].jobs_id);
    } else {
      selectedJobs = this.updateForm.value.jobs
        .map((v, i) => v ? this.jobsArray[i].jobs_id : null)
        .filter(v => v !== null);
    }

    // delete jobs by calling the api
    this.manage.deleteJobs(
      this.user.user_id,
      selectedJobs
    ).subscribe(data => {
      // iterate jobsArray for jobs to remove
      let len = this.jobsArray.length;
      for(var i = len - 1; i >= 0; i--) {
        // if job should be removed then remove it
        if(selectedJobs.includes(this.jobsArray[i].jobs_id)) {
          // console.log('removing:', i, ' job:', this.jobsArray[i]);
          this.jobsArray.splice(i, 1);
        }
      }

      // emit to parent the updated jobsArray
      this.jobsArrayUpdate.emit(of(this.jobsArray));

      // close settings
      this.forceClose();
    }, error => {
      // console.log(error);
      // display error
      this.message = 'Error bulk updating jobs, please retry.';
      this.displayMessage = true;
    });
  }

}

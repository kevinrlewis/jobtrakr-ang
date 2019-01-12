import { Component, OnInit, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';


import { ManageService } from './../../../manage.service';
import { Job } from './../../../../models/job.model';
import { User } from './../../../../models/user.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  @Input() job: Job;
  @Input() displayEdit: boolean;
  @Input() user: User;
  @Input() jobsArray: Job[];

  @Output() displayEditChange = new EventEmitter<boolean>();
  @Output() jobsArrayUpdate = new EventEmitter<Job[]>();

  // font awesome icons
  faFileDownload = faFileDownload;

  editForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  files: string;

  attachmentsObservable: Observable<Array<any>>;

  displayMessage: boolean;
  validationMessage = [];

  // array to hold ids for files that need to be attached to a job
  filesArray: string[];

  constructor(private fb: FormBuilder, private manage: ManageService) { }

  ngOnInit() {
    // initialize edit form
    this.editForm = this.fb.group({
      'companyName': [this.companyName, [Validators.required]],
      'jobTitle': [this.jobTitle, [Validators.required]],
      'link': [this.link, [Validators.required]],
      'notes': [this.notes, []],
      'files': [this.files, []],
    });

    this.attachmentsObservable = of(this.job.attachments);
  }

  /*
    handle closing the edit box
  */
  close(event) {
    // determine if the click was within the edit box
    if(event.target.closest('.edit')) {
      // if click was within box then continue displaying edit
      this.displayEditChange.emit(true);
    } else {
      // if click was outside the box then close the edit box
      this.displayEditChange.emit(false);
    }
  }

  /*
    funtion to be called when a non user action closes the edit form
  */
  forceClose() {
    this.displayEditChange.emit(false);
  }

  /*
    validate the add form
  */
  validateForm(l:FormGroup) {
    let formVar = l.value;

    // variables to return
    let messageList: Array<string> = [];
    let status: boolean = true;

    // validate fields
    // iterate properties
    for(var property in formVar) {
      // if value isn't null
      if(formVar.hasOwnProperty(property) && formVar[property] != null) {
        // if value is a link then validate the link
        if(property == 'link') {
          if(!this.manage.isValidUrl(formVar[property])) {
            status = false;
            messageList.push('Link invalid.');
          }
        }
        // validate the form requirements
        if(this.editForm.get(property).invalid) {
          status = false;
          messageList.push(this.editForm.get(property) + ' invalid.');
        }
      }
    }

    // return object
    return { status: status, message: messageList };
  }

  /*
    function called when the update button is clicked to submit changes
    to a job
  */
  editFormSubmit() {
    var validated = this.validateForm(this.editForm);

    // handle invalid entries
    if(!validated.status) {
      this.displayMessage = true;
      this.validationMessage = validated.message;
    } else {
      // check if any files are attached
      // if so then create the string to pass to db
      var temp = this.manage.formatFileNamePayload(this.filesArray);

      this.editForm.value.files = temp;

      this.manage.updateJob(
        this.user.user_id,
        this.job.jobs_id,
        this.editForm.value
      ).subscribe(data => {
        console.log(data);
        // set the job to the updated job
        this.job = data.data.update_job;

        // store array length
        var arrLength = this.jobsArray.length;

        // iterate jobs array to find the job to update
        for(var i = 0; i < arrLength; i++) {
          // when found
          if(this.jobsArray[i].jobs_id === this.job.jobs_id) {
            // set the job with jobs_id to the updated job
            this.jobsArray[i] = this.job;
          }
        }

        // emit the updated jobsArray to the parent component
        this.jobsArrayUpdate.emit(this.jobsArray);

        // close the edit component
        this.forceClose();
      }, error => {
        console.log(error);
        // display error
        if(error.status !== 200) {
          this.validationMessage.push('Error updating job, please retry.');
          this.displayMessage = true;
        }
      });
    }
  }

  /*
    function to remove an attachment from the database and s3 by calling the
    api
    the function calls the api through a function in the manage.service.ts file
  */
  removeAttachment(attachment) {
    console.log('removing attachment:', attachment);
    this.manage.deleteFile(this.user.user_id, this.job.jobs_id, attachment.file_name).subscribe(data => {
      console.log('removeAttachment:', data);
      // if the file was successfully removed from job/db and deleted from s3
      if(data.message === "Success") {
        // remove attachment from array
        var i = 0;
        if(this.job.attachments !== null) {
          // determine index of attachment
          this.job.attachments.forEach((at, index) => function() {
            if(at === attachment) {
              i = index;
            }
          });
          // splice attachment from array
          this.job.attachments.splice(i, 1);
        }
      }
    });
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

  /*
    listen to changes to the file input tag
    upload files that are attached and store their location
    in order to associate the files to a specific job
  */
  onFileChange(event) {
    // save the file with the specific job type
    this.filesArray = this.manage.saveFile(event, this.job.job_type_id);
  }
}

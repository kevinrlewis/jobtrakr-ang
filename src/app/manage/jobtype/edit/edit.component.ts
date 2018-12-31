import { Component, OnInit, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';


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

  @Output() displayEditChange = new EventEmitter<boolean>();

  editForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  files: string;

  attachmentsObservable: Observable<Array<any>>;

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

  // handle closing the edit box
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

  /**/
  editFormSubmit() {

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
        // determine index of attachment
        this.job.attachments.forEach((at, index) => function() {
          if(at === attachment) {
            i = index;
          }
        });
        // splice attachment from array
        this.job.attachments.splice(i, 1);
      }
    });
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

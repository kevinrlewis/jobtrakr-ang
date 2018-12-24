import { Component, OnInit, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Job } from './../../../../models/job.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  @Input() job: Job;
  @Input() displayEdit: boolean;

  @Output() displayEditChange = new EventEmitter<boolean>();

  editForm: FormGroup;
  companyName: string;
  jobTitle: string;
  link: string;
  notes: string;
  files: string;

  attachmentsObservable: Observable<Array<any>>;

  constructor(private fb: FormBuilder) { }

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

  editFormSubmit() {
    
  }

}

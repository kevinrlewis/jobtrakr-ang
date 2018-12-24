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
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @Input() jobsObservable: Observable<Array<Job>>;
  @Input() displaySettings: boolean;

  @Output() displaySettingsChange = new EventEmitter<boolean>();

  updateForm: FormGroup;

  constructor(private fb: FormBuilder) {

  }

  ngOnInit() {
    // initialize update form
    this.updateForm = this.fb.group({
    });
  }

  // handle closing the settings box
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

  updateFormSubmit() {

  }

}

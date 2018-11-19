import { Component, OnInit, Input } from '@angular/core';
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

  token: string;

  constructor(private router: Router, private cookieService: CookieService, private fb: FormBuilder) { }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
    this.addOpportunityForm = this.fb.group({
      'companyname': [this.companyName, [Validators.required]],
      'jobtitle': [this.jobTitle, [Validators.required]],
      'link': [this.link, [Validators.required]],
    });
  }

  close() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

}

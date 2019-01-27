import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators'

import { User } from './../../models/user.model';

import { ManageService } from './../manage.service';

@Component({
  selector: 'app-headerbar',
  templateUrl: './headerbar.component.html',
  styleUrls: ['./headerbar.component.css']
})
export class HeaderbarComponent implements OnInit {

  @Input() name: string;
  // @Output() manageClicked: EventEmitter<any> = new EventEmitter<any>();

  @Input() signedProfileImageUrl: string;
  userId: string;
  token: string;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private manage: ManageService,
    private activatedRoute: ActivatedRoute
  ) {
    // initialize the token from the cookie
    this.token = this.cookieService.get('SESSIONID');
    this.userId = jwt_decode(this.token).sub;
  }

  ngOnInit() {

  }

  // handle a click when the user wants to go to manage
  manageClick() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

  // handle a click when the user wants to navigate to settings
  settingsClick() {
    this.router.navigate(['settings/' + jwt_decode(this.token).sub]);
  }

  // handle a click when user clicks their name
  navbarBrandClick() {
    this.router.navigate(['profile/' + jwt_decode(this.token).sub]);
  }

  // handle button click when user is trying to logout
  logoutClick() {
    this.cookieService.delete('SESSIONID', '/');
    this.router.navigate(['/login']);
  }

}

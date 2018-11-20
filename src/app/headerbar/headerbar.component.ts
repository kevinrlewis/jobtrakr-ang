import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";

@Component({
  selector: 'app-headerbar',
  templateUrl: './headerbar.component.html',
  styleUrls: ['./headerbar.component.css']
})
export class HeaderbarComponent implements OnInit {

  @Input() name: string;
  // @Output() manageClicked: EventEmitter<any> = new EventEmitter<any>();

  token: string;

  constructor(private cookieService: CookieService, private router: Router) { }

  ngOnInit() {
    // initialize the token from the cookie
    this.token = this.cookieService.get('SESSIONID');
  }

  // handle a click when the user wants to go to manage
  manageClick() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

  // handle a click when the user wants to navigate to settings
  settingsClick() {
    this.router.navigate(['profile/' + jwt_decode(this.token).sub]);
  }

  // handle a click when user clicks their name
  navbarBrandClick() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

  // handle button click when user is trying to logout
  logoutClick() {
    this.cookieService.delete('SESSIONID', '/');
    this.router.navigate(['/login']);
  }

}

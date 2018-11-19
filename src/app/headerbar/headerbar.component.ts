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
    this.token = this.cookieService.get('SESSIONID');
  }

  manageClick() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

  settingsClick() {
    this.router.navigate(['profile/' + jwt_decode(this.token).sub]);
  }

  logoutClick() {
    console.log('deleting cookie...');
    // this.cookieService.delete('SESSIONID', '/', '/');
    // this.cookieService.deleteAll('../');
    this.cookieService.set('SESSIONID', '', new Date("Thu, 01 Jan 1970 00:00:01 GMT"));
    console.log('cookie deleted...');
    console.log('cookie: ', this.cookieService.get('SESSIONID'));
  }

}

import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-interviews',
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.css']
})
export class InterviewsComponent implements OnInit {

  faTimes = faTimes;
  token: string;

  constructor(private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    this.token = this.cookieService.get('SESSIONID');
  }

  close() {
    this.router.navigate(['manage/' + jwt_decode(this.token).sub]);
  }

}

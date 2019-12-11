import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    public auth: AuthService,
    private cookieService: CookieService
  ) {
    router.events.subscribe((val) => {
        // document.body.style.background = 'url(\'../../assets/home1.jpg\') no-repeat center center fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.height = '100%';
    });
  }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) {
    router.events.subscribe((val) => {
        // see also
        document.body.style.background = '#393E41';
        console.log(val instanceof NavigationEnd);
    });
  }

  ngOnInit() {
  }

}

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public router: Router, private auth: AuthService, private cookieService: CookieService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.cookieService.get('SESSIONID');

    // verify that the user is authenticated
    // if not authenticated then redirect to login page
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }

    // if the path does not equal the json web token then
    // redirect to the correct profile
    if(next.url[1].path !== jwt_decode(token)['sub']) {
      this.router.navigate(['manage/' + jwt_decode(token)['sub']]);
      return false;
    }
    return true;
  }
}

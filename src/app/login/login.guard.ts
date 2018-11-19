import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(public router: Router, private auth: AuthService, private cookieService: CookieService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.cookieService.get('SESSIONID');

    // console.log('profile/' + jwt_decode(token).sub);
    if(this.auth.isAuthenticated()) {
      this.router.navigate(['manage/' + jwt_decode(token).sub]);
      return false;
    }

    return true;
  }
}

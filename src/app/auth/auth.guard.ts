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
    // console.log(parseInt(next.url[1].path), ' !== ', parseInt(jwt_decode(token).sub));
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }

    if(next.url[1].path !== jwt_decode(token).sub) {
      this.router.navigate(['profile/' + jwt_decode(token).sub])
      return false;
    }
    return true;
  }
}

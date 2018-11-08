import { Injectable } from '@angular/core';
// import { JwtHelper } from '@auth0/angular-jwt';

@Injectable()
export class AuthService {

  constructor() {}

  // ...
  public isAuthenticated(): boolean {

    const token = localStorage.getItem('token');

    // Check whether the token is expired and return
    // true or false
    // return !this.jwtHelper.isTokenExpired(token);
    return true;
  }

}

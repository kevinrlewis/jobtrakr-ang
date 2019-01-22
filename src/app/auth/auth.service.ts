import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from "jwt-decode";
import { environment } from '../../environments/environment';
import { NGXLogger } from 'ngx-logger';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Credentials': 'true'
  }),
  // withCredentials: true,
  // credentials: 'include'
};

const API_URL = environment.apiUrl;

@Injectable()
export class AuthService {

  jwtHelper:JwtHelperService;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private logger: NGXLogger
  ) {
    this.jwtHelper = new JwtHelperService();
  }

  // check if token is authenticated
  public isAuthenticated(): boolean {

    // get token
    const token = this.cookieService.get('SESSIONID');

    // check if token is null, empty, or undefined
    if(token === null || token === "" || token === undefined) {
      this.logger.error('token is null, empty, or undefined');
      return false;
    }

    // check and return if the token has expired
    return !this.jwtHelper.isTokenExpired(token);
  }

  public login(email:string, password:string) {
    this.logger.debug('logging in...');
    this.logger.debug(API_URL + '/api/login');
    // look into piping for error handling
    return this.http.post<LoginResponse>(
      API_URL + '/api/login',
      {
        'email': email,
        'password': password
      },
      httpOptions
    );
  }

}

interface LoginResponse {
  message: string,
  id: number
}

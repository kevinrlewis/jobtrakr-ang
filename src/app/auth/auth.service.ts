import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
// import { JwtHelper } from '@auth0/angular-jwt';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {}

  // ...
  // public isAuthenticated(): boolean {
  //
  //   const token = localStorage.getItem('token');
  //
  //   // Check whether the token is expired and return
  //   // true or false
  //   // return !this.jwtHelper.isTokenExpired(token);
  //   return true;
  // }

  public login(email:string, password:string) {
    // look into piping for error handling
    return this.http.post<LoginResponse>(
      'http://localhost:3000/api/login',
      {
        'email': email,
        'password': password
      }
    );
  }

}

interface LoginResponse {
  message: string
}

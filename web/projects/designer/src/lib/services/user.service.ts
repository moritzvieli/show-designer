import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // the authentication token
  token: string;
  tokenExpiration: Date;
  username: string;

  constructor(
    private http: HttpClient
  ) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    this.token = localStorage.getItem('token');
    this.tokenExpiration = undefined;
    if (localStorage.getItem('tokenExpiration')) {
      this.tokenExpiration = new Date(Date.parse(localStorage.getItem('tokenExpiration')));
    }
    this.username = localStorage.getItem('username');
  }

  // register a new user
  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post('register?email=' + email + '&username=' + username + '&password=' + password, null);
  }

  // login a user
  login(email: string, password: string): Observable<any> {
    return this.http.post('login?email=' + email + '&password=' + password, null).pipe(map((result: any) => {
      console.log(result.token);
      this.token = result.token;
      this.username = result.username;

      // the token expires one month from now
      this.tokenExpiration = new Date();
      this.tokenExpiration.setDate(this.tokenExpiration.getDate() + 30);

      // store to the local storage
      localStorage.setItem('token', this.token);
      localStorage.setItem('tokenExpiration', JSON.stringify(this.tokenExpiration));
      localStorage.setItem('username', this.username);

      this.loadFromLocalStorage();
    }));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('username');

    this.loadFromLocalStorage();
  }

  isLoggedIn(): boolean {
    if (!this.token) {
      return false;
    }

    if (new Date() > this.tokenExpiration) {
      return false;
    }

    return true;
  }

}

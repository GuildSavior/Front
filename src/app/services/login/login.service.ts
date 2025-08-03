import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { User } from '../../models/user.model';

export interface Credentials {
  username: string,
  password: string
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private BASE_URL = 'http://82.112.255.241:8080';
  user = signal<User | null | undefined>(undefined);
  constructor() { }
/*
  login(credentials: Credentials): Observable<User | null | undefined>
  {
    return this.http.post(this.BASE_URL + '/api/login/', credentials)
    .pipe(
      tap(
        (result: any) =>
          {
            console.log("clem", result);
        localStorage.setItem('token', result['access_token']);
        const user = Object.assign(new User(), result['user']);
        this.user.set(user)
          }),
          map((result: any) => {
            return this.user()
          })
        )
  }

  getUser(): Observable<User | null | undefined> {
    return this.http.get(this.BASE_URL + '/api/me').pipe(
      tap((result: any) => {
        const user = Object.assign(new User(), result);
        this.user.set(user);
      }),
      map((result: any) => { return this.user(); })
   )
  }
*/
  /*logout() {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
    });
    return this.http.post(this.BASE_URL + '/api/logout', {}, { headers }).pipe(
      tap(() => {
        localStorage.clear();
        this.user.set(null);
      })
    );
}
*/

}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  user: any = null;
  http = inject(HttpClient);
  private backendUrl = 'http://82.112.255.241:8080/api';

  constructor() { }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  getUserInformation(): Observable<any> {
    const token = this.getCookie('auth_token');
    
    if (!token) {
      return throwError('No auth token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.backendUrl}/user`, { headers });
  }
}


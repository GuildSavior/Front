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
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiscordAuthService {
  private backendUrl = 'http://127.0.0.1:8000/api/auth/discord';

  constructor(private http: HttpClient) {}

  loginWithDiscord() {
    window.location.href = this.backendUrl;
  }
}

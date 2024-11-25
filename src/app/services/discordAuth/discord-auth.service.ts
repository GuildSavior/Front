import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiscordAuthService {
  private backendUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  loginWithDiscord(): void {
    window.location.href = `${this.backendUrl}/api/auth/discord/redirect`;
  }
}

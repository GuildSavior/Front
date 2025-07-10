import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Guild } from '../../models/guild.model';

@Injectable({
  providedIn: 'root'
})
export class GuildService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor() { }

  // ✅ Créer une guilde (nécessite Premium)
  createGuild(guildData: Partial<Guild>): Observable<any> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/guilds`, guildData, { headers });
  }

  // ✅ Récupérer la guilde de l'utilisateur
  getUserGuild(): Observable<any> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/user/guild`, { headers });
  }

  // ✅ Helper pour récupérer le token
  private getAuthToken(): string {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1] || '';
  }
}

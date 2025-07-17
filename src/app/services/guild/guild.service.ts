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

  // ✅ Même méthode de récupération du token que ton AuthService
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // ✅ Helper pour récupérer le token
  private getAuthToken(): string {
    return this.getCookie('auth_token') || '';
  }

  // ✅ Headers avec le token
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Créer une guilde (correspond à ta route POST /guilds/)
  createGuild(guildData: Partial<Guild>): Observable<any> {
    console.log('🏰 GuildService - Creating guild:', guildData);
    return this.http.post(`${this.apiUrl}/guilds`, guildData, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Récupérer ma guilde actuelle (correspond à ta route GET /guilds/current)
  getCurrentGuild(): Observable<any> {
    return this.http.get(`${this.apiUrl}/guilds/current`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Lister toutes les guildes (correspond à ta route GET /guilds/)
  getAllGuilds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/guilds`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Rejoindre une guilde (correspond à ta route POST /guilds/{guild}/join)
  joinGuild(guildId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/guilds/${guildId}/join`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Quitter ma guilde (correspond à ta route POST /guilds/leave)
  leaveGuild(): Observable<any> {
    return this.http.post(`${this.apiUrl}/guilds/leave`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Récupérer les membres de ma guilde avec leurs profils joueur
  getGuildMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/guilds/members`, { 
      headers: this.getAuthHeaders() 
    });
  }
}

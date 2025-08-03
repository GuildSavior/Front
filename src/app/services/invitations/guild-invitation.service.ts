import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // ✅ Importer l'environnement
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuildInvitationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl; // ✅ URL dynamique

  constructor() {
    // ✅ Log en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 GuildInvitationService - API URL:', this.apiUrl);
    }
  }

  // ✅ Récupérer le token comme dans tes autres services
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('auth_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Créer une invitation
  createInvitation(maxUses?: number, expiresInHours?: number): Observable<any> {
    const data: any = {};
    if (maxUses) data.max_uses = maxUses;
    if (expiresInHours) data.expires_in_hours = expiresInHours;

    return this.http.post(`${this.apiUrl}/invitations`, data, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Récupérer mes invitations
  getMyInvitations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/invitations`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Rejoindre via invitation
  joinViaInvitation(code: string): Observable<any> {
    return this.http.get(`http://82.112.255.241:8080/api/invite/${code}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Désactiver invitation
  deactivateInvitation(invitationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/invitations/${invitationId}`, { 
      headers: this.getAuthHeaders() 
    });
  }
  // Dans guild-invitation.service.ts
  joinGuild(code: string): Observable<any> {
    const url = `${this.apiUrl}/invitations/${code}/join`;
    
    if (environment.enableDebugLogs) {
      console.log('🔧 Appel API joinGuild:', url);
    }
    
    return this.http.post(url, {}, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://82.112.255.241:8080/api';

  constructor() { }

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

  // ✅ Mon profil joueur
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/player`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Créer/modifier mon profil
  createOrUpdateProfile(playerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/player`, playerData, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ✅ Supprimer mon profil
  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/player`, { 
      headers: this.getAuthHeaders() 
    });
  }
}

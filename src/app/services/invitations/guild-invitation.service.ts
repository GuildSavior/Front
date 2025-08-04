import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GuildInvitationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() {
    if (environment.enableDebugLogs) {
      console.log('🔧 GuildInvitationService initialisé');
      console.log('🔧 API URL:', this.apiUrl);
    }
  }

  private debugLog(message: string, data?: any) {
    if (environment.enableDebugLogs) {
      console.log(`🔧 GuildInvitationService: ${message}`, data || '');
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('auth_token');
    
    if (environment.enableDebugLogs && !token) {
      console.warn('🔧 GuildInvitationService: Aucun token d\'authentification trouvé');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ CORRIGER: Créer une invitation (POST /api/guilds/invitations)
  createInvitation(invitationData: any): Observable<any> {
    const url = `${this.apiUrl}/guilds/invitations`;
    this.debugLog('Création invitation', { url, data: invitationData });
    
    return this.http.post(url, invitationData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Invitation créée', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur création invitation', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ CORRIGER: Récupérer mes invitations (GET /api/guilds/invitations)
  getMyInvitations(): Observable<any> {
    const url = `${this.apiUrl}/guilds/invitations`;
    this.debugLog('Récupération invitations', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Invitations récupérées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération invitations', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ CORRIGER: Rejoindre via invitation (GET /api/invite/{code})
  joinViaInvitation(code: string): Observable<any> {
    const url = `${this.apiUrl}/invite/${code}`;
    this.debugLog('Rejoindre via invitation', { url, code });
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde rejointe via invitation', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur rejoindre via invitation', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ CORRIGER: Désactiver invitation (DELETE /api/guilds/invitations/{invitation})
  deactivateInvitation(invitationId: number): Observable<any> {
    const url = `${this.apiUrl}/guilds/invitations/${invitationId}`;
    this.debugLog('Désactivation invitation', { url, invitationId });
    
    return this.http.delete(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Invitation désactivée', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur désactivation invitation', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ NOUVELLE méthode pour suppression définitive
  deleteInvitation(invitationId: number): Observable<any> {
    const url = `${this.apiUrl}/guilds/invitations/${invitationId}/delete`;
    this.debugLog('Suppression définitive invitation', { url, invitationId });
    
    return this.http.delete(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Invitation supprimée définitivement', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur suppression définitive invitation', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ NOUVELLE méthode pour nettoyer toutes les invitations inactives
  cleanupInactiveInvitations(): Observable<any> {
    const url = `${this.apiUrl}/guilds/invitations/cleanup-inactive`;
    this.debugLog('Nettoyage invitations inactives', url);
    
    return this.http.delete(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Invitations inactives nettoyées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur nettoyage invitations inactives', error);
        return throwError(() => error);
      })
    );
  }
}

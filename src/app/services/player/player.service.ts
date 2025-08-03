import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // ✅ AJOUTER

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // ✅ URL dynamique selon l'environnement

  constructor() {
    // ✅ Debug en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 PlayerService initialisé');
      console.log('🔧 API URL:', this.apiUrl);
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
    
    if (environment.enableDebugLogs && !token) {
      console.warn('🔧 PlayerService: Aucun token d\'authentification trouvé');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Logger conditionnel
  private debugLog(message: string, data?: any) {
    if (environment.enableDebugLogs) {
      console.log(`🔧 PlayerService: ${message}`, data || '');
    }
  }

  // ✅ Mon profil joueur
  getMyProfile(): Observable<any> {
    const url = `${this.apiUrl}/player`;
    this.debugLog('Récupération du profil joueur', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true // ✅ AJOUTER pour les cookies
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Profil joueur récupéré', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération profil', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Créer/modifier mon profil
  createOrUpdateProfile(playerData: any): Observable<any> {
    const url = `${this.apiUrl}/player`;
    this.debugLog('Création/Modification du profil joueur', { url, data: playerData });
    
    return this.http.post(url, playerData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true // ✅ AJOUTER pour les cookies
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Profil joueur sauvegardé', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur sauvegarde profil', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Supprimer mon profil
  deleteProfile(): Observable<any> {
    const url = `${this.apiUrl}/player`;
    this.debugLog('Suppression du profil joueur', url);
    
    return this.http.delete(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true // ✅ AJOUTER pour les cookies
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Profil joueur supprimé', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur suppression profil', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ BONUS: Récupérer les statistiques d'un joueur (si nécessaire plus tard)
  getPlayerStats(playerId?: number): Observable<any> {
    const url = playerId 
      ? `${this.apiUrl}/player/${playerId}/stats`
      : `${this.apiUrl}/player/stats`;
    
    this.debugLog('Récupération des statistiques joueur', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Statistiques joueur récupérées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération statistiques', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ BONUS: Mettre à jour les DKP (pour plus tard)
  updateDKP(dkpChange: number, reason?: string): Observable<any> {
    const url = `${this.apiUrl}/player/dkp`;
    const data = { dkp_change: dkpChange, reason: reason || 'Modification manuelle' };
    
    this.debugLog('Mise à jour DKP', { url, data });
    
    return this.http.patch(url, data, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ DKP mis à jour', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur mise à jour DKP', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ BONUS: Vérifier si le joueur a un profil
  hasProfile(): Observable<boolean> {
    return this.getMyProfile().pipe(
      tap(() => this.debugLog('✅ Le joueur a un profil')),
      catchError((error) => {
        if (error.status === 404) {
          this.debugLog('ℹ️ Le joueur n\'a pas de profil');
          return throwError(() => ({ hasProfile: false }));
        }
        return throwError(() => error);
      })
    );
  }
}

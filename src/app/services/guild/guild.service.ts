import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; // ✅ AJOUTER
import { throwError } from 'rxjs'; // ✅ AJOUTER
import { Guild } from '../../models/guild.model';
import { environment } from '../../../environments/environment'; // ✅ AJOUTER

@Injectable({
  providedIn: 'root'
})
export class GuildService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // ✅ URL dynamique selon l'environnement

  constructor() {
    // ✅ Debug en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 GuildService initialisé');
      console.log('🔧 API URL:', this.apiUrl);
    }
  }

  // ✅ Logger conditionnel
  private debugLog(message: string, data?: any) {
    if (environment.enableDebugLogs) {
      console.log(`🔧 GuildService: ${message}`, data || '');
    }
  }

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
    
    if (environment.enableDebugLogs && !token) {
      console.warn('🔧 GuildService: Aucun token d\'authentification trouvé');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Créer une guilde (correspond à ta route POST /guilds/)
  createGuild(guildData: Partial<Guild>): Observable<any> {
    const url = `${this.apiUrl}/guilds`;
    this.debugLog('Création de guilde', { url, data: guildData });
    
    return this.http.post(url, guildData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true // ✅ AJOUTER pour les cookies
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde créée avec succès', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur création guilde', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Récupérer ma guilde actuelle (correspond à ta route GET /guilds/current)
  getCurrentGuild(): Observable<any> {
    const url = `${this.apiUrl}/guilds/current`;
    this.debugLog('Récupération guilde actuelle', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true // ✅ AJOUTER pour les cookies
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde actuelle récupérée', response);
      }),
      catchError((error: any) => {
        this.debugLog('❌ Erreur récupération guilde actuelle', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Lister toutes les guildes (correspond à ta route GET /guilds/)
  getAllGuilds(): Observable<any> {
    const url = `${this.apiUrl}/guilds`;
    this.debugLog('Récupération toutes les guildes', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Toutes les guildes récupérées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération guildes', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Rejoindre une guilde (correspond à ta route POST /guilds/{guild}/join)
  joinGuild(guildId: number): Observable<any> {
    const url = `${this.apiUrl}/guilds/${guildId}/join`;
    this.debugLog('Rejoindre guilde', { url, guildId });
    
    return this.http.post(url, {}, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde rejointe avec succès', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur pour rejoindre la guilde', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Quitter ma guilde (correspond à ta route POST /guilds/leave)
  leaveGuild(): Observable<any> {
    const url = `${this.apiUrl}/guilds/leave`;
    this.debugLog('Quitter guilde', url);
    
    return this.http.post(url, {}, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde quittée avec succès', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur pour quitter la guilde', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Récupérer les membres de ma guilde avec leurs profils joueur
  getGuildMembers(): Observable<any> {
    const url = `${this.apiUrl}/guilds/members`;
    this.debugLog('Récupération membres guilde', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Membres guilde récupérés', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération membres', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ BONUS: Mettre à jour ma guilde (pour plus tard)
  updateGuild(guildData: Partial<Guild>): Observable<any> {
    const url = `${this.apiUrl}/guilds`;
    this.debugLog('Mise à jour guilde', { url, data: guildData });
    
    return this.http.put(url, guildData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde mise à jour', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur mise à jour guilde', error);
        return throwError(() => error);
      })
    );
  }

  // guild.service.ts
  disbandGuild(): Observable<any> {
    const url = `${this.apiUrl}/guilds/disband`;
    this.debugLog('Dissolution de guilde', url);
    
    return this.http.delete(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Guilde dissoute avec succès', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur dissolution guilde', error);
        return throwError(() => error);
      })
    );
  }
}

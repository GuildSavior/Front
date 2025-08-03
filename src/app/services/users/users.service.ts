import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model'; // ✅ CORRIGER le chemin

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  user: User | null = null;
  http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { 
    if (environment.enableDebugLogs) {
      console.log('🔧 UsersService initialisé');
      console.log('🔧 API URL:', this.apiUrl);
    }
  }

  private debugLog(message: string, data?: any) {
    if (environment.enableDebugLogs) {
      console.log(`🔧 UsersService: ${message}`, data || '');
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
      console.warn('🔧 UsersService: Aucun token d\'authentification trouvé');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ CORRIGER: La méthode doit retourner directement l'utilisateur, pas une réponse wrappée
  getUserInformation(): Observable<User> {
    const token = this.getCookie('auth_token');
    
    if (!token) {
      this.debugLog('❌ Aucun token d\'authentification trouvé');
      return throwError(() => new Error('No auth token found'));
    }

    const url = `${this.apiUrl}/user`;
    this.debugLog('Récupération des informations utilisateur', url);

    return this.http.get<User>(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response: User) => {
        this.user = response;
        this.debugLog('✅ Informations utilisateur récupérées', response);
        this.debugLog('✅ Username:', response.username);
        this.debugLog('✅ Avatar:', response.avatar);
        this.debugLog('✅ Discord ID:', response.discord_id);
        this.debugLog('✅ Statut premium:', response.is_premium);
        this.debugLog('✅ Guild ID:', response.guild_id);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération informations utilisateur', error);
        this.user = null;
        return throwError(() => error);
      })
    );
  }

  // ✅ Mettre à jour le profil utilisateur
  updateUserProfile(userData: Partial<User>): Observable<{ success: boolean; user: User; message: string }> {
    const url = `${this.apiUrl}/user/profile`;
    this.debugLog('Mise à jour du profil utilisateur', { url, data: userData });

    return this.http.put<{ success: boolean; user: User; message: string }>(url, userData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.user = response.user; // ✅ Mettre à jour l'utilisateur local
        this.debugLog('✅ Profil utilisateur mis à jour', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur mise à jour profil utilisateur', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Récupérer l'utilisateur actuel (depuis le cache ou l'API)
  getCurrentUser(): Observable<User> {
    // Si on a déjà l'utilisateur en cache et qu'on n'est pas en mode debug
    if (this.user && !environment.debugMode) {
      this.debugLog('✅ Utilisateur récupéré depuis le cache', this.user);
      return new Observable(observer => {
        observer.next(this.user!);
        observer.complete();
      });
    }
    
    return this.getUserInformation();
  }

  // ✅ Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const token = this.getCookie('auth_token');
    const isAuth = !!token;
    this.debugLog('Vérification authentification', { hasToken: isAuth });
    return isAuth;
  }

  // ✅ Vérifier si l'utilisateur est premium
  isPremium(): boolean {
    const isPremium = this.user?.is_premium || false;
    this.debugLog('Vérification statut premium', { isPremium, user: this.user?.username });
    return isPremium;
  }

  // ✅ Vérifier si l'utilisateur a une guilde
  hasGuild(): boolean {
    const hasGuild = !!this.user?.guild_id;
    this.debugLog('Vérification appartenance guilde', { hasGuild, guildId: this.user?.guild_id });
    return hasGuild;
  }

  // ✅ Récupérer les informations de subscription
  getSubscriptionInfo(): Observable<{ success: boolean; subscription: any }> {
    const url = `${this.apiUrl}/user/subscription`;
    this.debugLog('Récupération des informations de subscription', url);

    return this.http.get<{ success: boolean; subscription: any }>(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        if (this.user) {
          this.user.subscription = response.subscription; // ✅ Mettre à jour la subscription
        }
        this.debugLog('✅ Informations de subscription récupérées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération subscription', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Nettoyer les données utilisateur
  clearUserData(): void {
    this.user = null;
    this.debugLog('✅ Données utilisateur nettoyées');
  }

  // ✅ Récupérer les statistiques utilisateur
  getUserStats(): Observable<{ 
    success: boolean; 
    stats: {
      total_dkp: number;
      events_participated: number;
      guild_rank?: string;
      days_since_join: number;
    }
  }> {
    const url = `${this.apiUrl}/user/stats`;
    this.debugLog('Récupération des statistiques utilisateur', url);

    return this.http.get<any>(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Statistiques utilisateur récupérées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération statistiques utilisateur', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Mettre à jour l'avatar utilisateur
  updateAvatar(avatarData: FormData): Observable<{ success: boolean; avatar_url: string; message: string }> {
    const url = `${this.apiUrl}/user/avatar`;
    this.debugLog('Mise à jour de l\'avatar utilisateur', url);

    const token = this.getCookie('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{ success: boolean; avatar_url: string; message: string }>(url, avatarData, { 
      headers: headers,
      withCredentials: true
    }).pipe(
      tap((response) => {
        if (this.user && response.avatar_url) {
          this.user.avatar = response.avatar_url; // ✅ Mettre à jour l'avatar local
        }
        this.debugLog('✅ Avatar utilisateur mis à jour', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur mise à jour avatar', error);
        return throwError(() => error);
      })
    );
  }
}


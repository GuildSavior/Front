import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  constructor() {
    if (environment.enableDebugLogs) {
      console.log('🔧 AuthService - API URL:', this.apiUrl);
    }
  }

  // ✅ Méthode pour récupérer les cookies
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // ✅ Vérifier si connecté
  isLoggedIn(): boolean {
    const token = this.getCookie('auth_token');
    const isAuthenticated = !!token;
    
    if (environment.enableDebugLogs) {
      console.log('🔧 AuthService.isLoggedIn():', isAuthenticated);
    }
    
    return isAuthenticated;
  }

  // ✅ Récupérer les headers d'auth
  getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Vérifier le statut d'auth avec l'API
  checkAuthStatus(): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.get(`${this.apiUrl}/user`, { 
      headers: this.getAuthHeaders(),
      withCredentials: true 
    }).pipe(
      catchError((error) => {
        if (environment.enableDebugLogs) {
          console.error('🔧 Erreur checkAuthStatus:', error);
        }
        return of(null);
      })
    );
  }

  // ✅ CORRIGER: Méthode de déconnexion côté serveur
  private logoutFromServer(): Observable<any> {
    this.debugLog('📡 Appel API logout...');

    return this.http.post(`${this.apiUrl}/logout`, {}, { 
      headers: this.getAuthHeaders(),
      withCredentials: true 
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Réponse serveur logout:', response);
      }),
      catchError((error) => {
        this.debugLog('⚠️ Erreur API logout (pas grave):', error);
        // Retourner succès même en cas d'erreur API
        return of({ success: true, message: 'Déconnexion locale effectuée' });
      })
    );
  }

  // ✅ CORRIGER: Méthode de nettoyage local
  private clearLocalData(): void {
    this.debugLog('🧹 Nettoyage des données locales...');
    
    // Nettoyer le stockage
    localStorage.clear();
    sessionStorage.clear();
    
    // ✅ NOUVEAU: Forcer la suppression du cookie auth_token
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
    
    this.debugLog('✅ Données locales nettoyées');
  }

  // ✅ NOUVELLE: Méthode de déconnexion complète
  logout(): void {
    this.debugLog('🚪 Début du processus de déconnexion...');
    
    // Toujours nettoyer les données locales d'abord
    this.clearLocalData();
    
    // Essayer de notifier le serveur (sans bloquer si ça échoue)
    this.logoutFromServer().subscribe({
      next: (response) => {
        this.debugLog('✅ Déconnexion serveur réussie:', response);
        this.redirectToHome();
      },
      error: (error) => {
        this.debugLog('⚠️ Erreur serveur ignorée:', error);
        this.redirectToHome();
      }
    });
  }

  // ✅ NOUVELLE: Méthode de redirection
  private redirectToHome(): void {
    this.debugLog('↪️ Redirection vers la page d\'accueil...');
    this.router.navigate(['/home']).then(() => {
      this.debugLog('✅ Redirection terminée');
      // ✅ Forcer le rechargement pour être sûr
      if (environment.production) {
        window.location.reload();
      }
    });
  }

  // ✅ Gérer les redirections post-login
  handlePostLoginRedirect() {
    // Vérifier s'il y a une invitation en attente
    const pendingGuildJoin = sessionStorage.getItem('pendingGuildJoin');
    
    if (pendingGuildJoin) {
      sessionStorage.removeItem('pendingGuildJoin');
      this.router.navigate([pendingGuildJoin]);
      return;
    }

    // Vérifier s'il y a un succès de dashboard en attente
    const pendingDashboardSuccess = localStorage.getItem('pendingDashboardSuccess');
    
    if (pendingDashboardSuccess) {
      localStorage.removeItem('pendingDashboardSuccess');
      this.router.navigate(['/dashboard'], { 
        queryParams: { loginSuccess: '1' } 
      });
      return;
    }

    // Redirection par défaut
    this.router.navigate(['/dashboard']);
  }

  // ✅ Méthode pour stocker une redirection en attente
  storePendingRedirect(url: string) {
    sessionStorage.setItem('pendingRedirect', url);
    this.debugLog('Redirection stockée', url);
  }

  // ✅ Méthode pour vérifier et exécuter une redirection en attente
  handlePendingRedirect() {
    const pendingRedirect = sessionStorage.getItem('pendingRedirect');
    if (pendingRedirect) {
      sessionStorage.removeItem('pendingRedirect');
      this.debugLog('Exécution redirection en attente', pendingRedirect);
      this.router.navigate([pendingRedirect]);
      return true;
    }
    return false;
  }

  // ✅ Logger conditionnel
  private debugLog(message: string, data?: any) {
    if (environment.enableDebugLogs) {
      console.log(`🔧 AuthService: ${message}`, data || '');
    }
  }
}

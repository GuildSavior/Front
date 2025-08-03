import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment'; // ✅ AJOUTER

@Injectable({
  providedIn: 'root'
})
export class DiscordAuthService {
  // ✅ URLs dynamiques selon l'environnement
  private backendUrl = `${environment.apiUrl}/auth/discord`;
  private logoutUrl = `${environment.apiUrl}/logout`;

  constructor(private http: HttpClient, private router: Router) {
    // ✅ Debug en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 DiscordAuthService initialisé');
      console.log('🔧 URL Discord Auth:', this.backendUrl);
      console.log('🔧 URL Logout:', this.logoutUrl);
    }
  }

  loginWithDiscord() {
    if (environment.enableDebugLogs) {
      console.log('🔧 Redirection vers Discord OAuth:', this.backendUrl);
    }
    
    window.location.href = this.backendUrl;
  }

  logout() {
    if (environment.enableDebugLogs) {
      console.log("🔧 Tentative de déconnexion...");
    }

    return this.http.get(this.logoutUrl, { withCredentials: true }).pipe(
      tap(() => {
        if (environment.enableDebugLogs) {
          console.log("✅ Déconnexion réussie");
        }
        // Plus besoin de supprimer le localStorage, le cookie sera supprimé côté serveur
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        if (environment.enableDebugLogs) {
          console.error("❌ Erreur lors du logout :", error);
        }
        return throwError(error);
      })
    ).subscribe();
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiscordAuthService {
  private backendUrl = 'http://82.112.255.241:8080/api/auth/discord';

  constructor(private http: HttpClient, private router: Router) {}

  loginWithDiscord() {
    window.location.href = this.backendUrl;
  }

  logout() {
    console.log("Tentative de déconnexion...");

    return this.http.get('http://82.112.255.241:8080/api/logout', { withCredentials: true }).pipe(
      tap(() => {
        console.log("Déconnexion réussie");
        // Plus besoin de supprimer le localStorage, le cookie sera supprimé côté serveur
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error("Erreur lors du logout :", error);
        return throwError(error);
      })
    ).subscribe();
  }
}

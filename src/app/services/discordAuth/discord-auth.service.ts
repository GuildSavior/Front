import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiscordAuthService {
  private backendUrl = 'http://127.0.0.1:8000/api/auth/discord';


  constructor(private http: HttpClient, private router: Router) {}

  loginWithDiscord() {
    window.location.href = this.backendUrl;
  }

  logout() {
    console.log("Tentative de déconnexion...");

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Aucun token trouvé !");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log("Envoi de la requête HTTP pour logout...");

    return this.http.get('http://127.0.0.1:8000/api/logout', { headers }).pipe(
      tap(() => {
        console.log("Déconnexion réussie, suppression du token...");
        localStorage.clear();
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error("Erreur lors du logout :", error);
        return throwError(error);
      })
    ).subscribe();
  }


}

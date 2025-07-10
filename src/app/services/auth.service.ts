import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from './users/users.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private userService = inject(UsersService);

  constructor() { }

  // ✅ Vérifier si l'utilisateur est connecté via cookie
  isLoggedIn(): boolean {
    const token = this.getCookie('auth_token');
    return !!token;
  }

  // ✅ Vérifier l'authentification avec l'API
  checkAuthStatus(): Observable<any> {
    const token = this.getCookie('auth_token');
    
    if (!token) {
      return of(null);
    }

    return this.userService.getUserInformation().pipe(
      map(response => response.user),
      catchError(() => {
        this.clearAuthCookie();
        return of(null);
      })
    );
  }

  // ✅ Fonction de logout
  logout() {
    this.clearAuthCookie();
    this.router.navigate(['/home']);
  }

  // ✅ Helper pour récupérer les cookies
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // ✅ Fonction pour nettoyer le cookie
  private clearAuthCookie() {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}

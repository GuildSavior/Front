import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';
import { UsersService } from '../../services/users/users.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment'; // ✅ AJOUTER

@Component({
  selector: 'app-discord-auth-callback',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align: center; padding: 2rem;">
      <h3>Connexion en cours...</h3>
      <p>Veuillez patienter...</p>
      <!-- ✅ Debug info en développement -->
      <small *ngIf="!environment.production" style="color: #fbbf24; display: block; margin-top: 1rem;">
        🔧 Environnement: {{ environment.production ? 'Production' : 'Développement' }}<br>
        🔧 API: {{ environment.apiUrl }}
      </small>
    </div>
  `,
  styleUrl: './discord-auth-callback.component.scss'
})
export class DiscordAuthCallbackComponent implements OnInit { 
  private authService = inject(DiscordAuthService);
  private userService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  // ✅ Exposer l'environnement au template
  environment = environment;

  ngOnInit() {
    // ✅ Debug en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 DiscordAuthCallback - Mode:', environment.production ? 'Production' : 'Développement');
      console.log('🔧 API URL configurée:', environment.apiUrl);
    }

    timer(1000).subscribe(() => {
      this.checkAuthStatus();
    });
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private checkAuthStatus() {
    // ✅ Debug conditionnel
    if (environment.enableDebugLogs) {
      console.log('=== DEBUG AUTH ===');
      console.log('Cookies disponibles:', document.cookie);
    }
    
    const token = this.getCookie('auth_token');
    
    if (environment.enableDebugLogs) {
      console.log('Token extrait du cookie:', token);
    }
    
    if (!token) {
      if (environment.enableDebugLogs) {
        console.error('❌ Pas de token trouvé dans les cookies');
      }
      this.router.navigate(['/home']);
      return;
    }

    // ✅ Utiliser l'API URL depuis l'environnement
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // ✅ URL dynamique selon l'environnement
    const apiUrl = `${environment.apiUrl}/user`;

    if (environment.enableDebugLogs) {
      console.log('🔧 Appel API vers:', apiUrl);
    }

    this.http.get(apiUrl, { headers, withCredentials: true })
      .subscribe({
        next: (user) => {
          if (environment.enableDebugLogs) {
            console.log('✅ API SUCCESS - Utilisateur connecté:', user);
          }
          
          // Vérifie les intentions d'achat
          if (localStorage.getItem('pendingPremium') === '1') {
            localStorage.removeItem('pendingPremium');
            this.router.navigate(['/home']); 
            return;
          }
          
          if (localStorage.getItem('pendingDashboardSuccess') === '1') {
            localStorage.removeItem('pendingDashboardSuccess');
            this.router.navigate(['/dashboard'], { queryParams: { payment: 'success' } });
            return;
          }
          
          // ✅ Gérer les redirections en attente (guild join)
          const pendingGuildJoin = sessionStorage.getItem('pendingGuildJoin');
          if (pendingGuildJoin) {
            sessionStorage.removeItem('pendingGuildJoin');
            this.router.navigate([pendingGuildJoin]);
            return;
          }
          
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          if (environment.enableDebugLogs) {
            console.error('❌ API ERROR:', error);
            console.log('Status:', error.status);
            console.log('URL appelée:', apiUrl);
          }
          this.router.navigate(['/home']);
        }
      });
  }
}


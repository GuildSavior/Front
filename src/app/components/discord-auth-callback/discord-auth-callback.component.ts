import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';
import { UsersService } from '../../services/users/users.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timer } from 'rxjs';

@Component({
  selector: 'app-discord-auth-callback',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align: center; padding: 2rem;">
      <h3>Connexion en cours...</h3>
      <p>Veuillez patienter...</p>
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

  ngOnInit() {
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
    console.log('=== DEBUG AUTH ===');
    console.log('Cookies disponibles:', document.cookie);
    
    const token = this.getCookie('auth_token');
    console.log('Token extrait du cookie:', token);
    
    if (!token) {
      console.error('❌ Pas de token trouvé dans les cookies');
      this.router.navigate(['/home']);
      return;
    }

    // Utilise le token comme Bearer token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://82.112.255.241:8080/api/user', { headers })
      .subscribe({
        next: (user) => {
          console.log('✅ API SUCCESS - Utilisateur connecté:', user);
          
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
          
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('❌ API ERROR:', error);
          console.log('Status:', error.status);
          this.router.navigate(['/home']);
        }
      });
  }
}


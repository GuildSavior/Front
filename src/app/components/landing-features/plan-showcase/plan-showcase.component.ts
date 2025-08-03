import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-showcase.component.html',
  styleUrl: './plan-showcase.component.scss'
})
export class PlanShowcaseComponent implements OnInit {
  isLoading = false;
  private discordAuth = inject(DiscordAuthService);
  private http = inject(HttpClient);

  ngOnInit() {
    // Si on revient du login Discord avec l'intention d'acheter le premium
    if (localStorage.getItem('pendingPremium') === '1') {
      console.log('Intention d\'achat détectée, vérification auth...');
      localStorage.removeItem('pendingPremium'); // ENLÈVE LE FLAG IMMÉDIATEMENT
      
      const token = this.getCookie('auth_token');
      
      if (!token) {
        console.log('Pas de token trouvé, utilisateur pas encore connecté');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      // Vérifie si l'utilisateur est connecté AVANT de relancer l'achat
      this.http.get('http://82.112.255.241:8080/api/user', { headers }).subscribe({
        next: (user) => {
          console.log('Utilisateur connecté après login Discord, lancement Stripe...');
          this.launchStripe(headers); // Passe les headers à launchStripe
        },
        error: () => {
          console.log('Utilisateur pas encore connecté après Discord, on attend...');
          // Ne pas remettre le flag pour éviter la boucle
        }
      });
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

  goPremium() {
    console.log("Lancement de l'achat premium");
    
    const token = this.getCookie('auth_token');
    
    if (!token) {
      console.warn('Utilisateur non connecté, redirection vers Discord');
      localStorage.setItem('pendingPremium', '1');
      this.discordAuth.loginWithDiscord();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log("Utilisateur connecté, lancement de Stripe");
    this.launchStripe(headers);
  }

  private launchStripe(headers?: HttpHeaders) {
    this.isLoading = true;
    
    // Si pas de headers passés, on les récupère du cookie
    if (!headers) {
      const token = this.getCookie('auth_token');
      if (!token) {
        this.isLoading = false;
        alert('Token non trouvé');
        return;
      }
      headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    
    this.http.post<{ url: string }>('http://82.112.255.241:8080/api/stripe/create-checkout-session', {}, { headers })
      .subscribe({
        next: (res) => {
          window.location.href = res.url;
        },
        error: () => {
          this.isLoading = false;
          alert('Erreur lors de la création de la session Stripe.');
        }
      });
  }
}

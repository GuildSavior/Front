import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment'; 

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
      localStorage.removeItem('pendingPremium');
      
      const token = this.getCookie('auth_token');
      
      if (!token) {
        console.log('Pas de token trouvé, utilisateur pas encore connecté');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      // ✅ CORRIGER: Utiliser environment.apiUrl
      this.http.get(`${environment.apiUrl}/user`, { headers }).subscribe({
        next: (user) => {
          console.log('Utilisateur connecté après login Discord, lancement Stripe...');
          this.launchStripe(headers);
        },
        error: () => {
          console.log('Utilisateur pas encore connecté après Discord, on attend...');
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

  // ✅ CORRIGER: launchStripe avec environment
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
    
    // ✅ CORRIGER: Utiliser environment.apiUrl au lieu de l'IP en dur
    this.http.post<{ url: string }>(`${environment.apiUrl}/stripe/create-checkout-session`, {}, { 
      headers,
      withCredentials: true // ✅ Ajouter aussi withCredentials pour la cohérence
    }).subscribe({
      next: (res) => {
        console.log('✅ Session Stripe créée:', res);
        window.location.href = res.url;
      },
      error: (error) => {
        console.error('❌ Erreur Stripe:', error);
        this.isLoading = false;
        alert('Erreur lors de la création de la session Stripe.');
      }
    });
  }
}

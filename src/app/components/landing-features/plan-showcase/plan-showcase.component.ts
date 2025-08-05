import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment'; 
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Ton service d'auth
import { NotificationService } from '../../../services/notification/notification.service';

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
  private router = inject(Router); // ✅ AJOUTER
  private authService = inject(AuthService); // ✅ AJOUTER si tu as un AuthService
  private notificationService = inject(NotificationService); // ✅ AJOUTER

  ngOnInit() {
    // ✅ AJOUTER: Vérifier si l'utilisateur a déjà un abonnement
    this.checkUserSubscriptionStatus();

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
      
      // ✅ MODIFIER: Vérifier l'abonnement avant de lancer Stripe
      this.http.get<any>(`${environment.apiUrl}/user`, { headers }).subscribe({
        next: (user) => {
          console.log('Utilisateur connecté après login Discord:', user);
          // ✅ Vérifier avec tes vraies propriétés
          const hasSubscription = user.is_premium === true || 
                                 (user.subscription && user.subscription.status === 'active');
          
          if (hasSubscription) {
            console.log('✅ Utilisateur déjà abonné, redirection vers dashboard');
            alert('Vous êtes déjà abonné ! Redirection vers votre dashboard...');
            this.router.navigate(['/dashboard']);
            return;
          }
          
          console.log('Utilisateur pas encore abonné, lancement Stripe...');
          this.launchStripe(headers);
        },
        error: () => {
          console.log('Utilisateur pas encore connecté après Discord, on attend...');
        }
      });
    }
  }

  // ✅ NOUVELLE MÉTHODE: Vérifier le statut d'abonnement
  private checkUserSubscriptionStatus() {
    const token = this.getCookie('auth_token');
    
    if (!token) {
      console.log('Pas de token, utilisateur non connecté');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${environment.apiUrl}/user`, { headers }).subscribe({
      next: (user) => {
        console.log('Statut utilisateur:', user);
        
        // ✅ Vérifier avec tes vraies propriétés
        const hasSubscription = user.is_premium === true || 
                               (user.subscription && user.subscription.status === 'active');
        
        if (hasSubscription) {
          console.log('🚫 Utilisateur déjà abonné, redirection...');
          // ✅ REMPLACER alert() par notification
          this.notificationService.success(
            'Déjà Premium !',
            'Vous êtes déjà abonné. Redirection vers votre dashboard...'
          );
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        }
      },
      error: (error) => {
        console.log('Erreur lors de la vérification du statut:', error);
      }
    });
  }

  goPremium() {
    console.log("Tentative de lancement de l'achat premium");
    
    const token = this.getCookie('auth_token');
    
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get<any>(`${environment.apiUrl}/user`, { headers }).subscribe({
        next: (user) => {
          const hasSubscription = user.user.is_premium === true || 
                                 (user.user.subscription && user.user.subscription.status === 'active');
          
          if (hasSubscription) {
            this.notificationService.warning(
              'Déjà abonné !', 
              'Vous êtes déjà Premium. Redirection vers votre dashboard...'
            );
            
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
            return;
          }

          console.log("✅ Utilisateur connecté et pas d'abonnement, lancement de Stripe");
          this.launchStripe(headers);
        },
        error: (error) => {
          console.error('Erreur lors de la vérification:', error);
          // ✅ REMPLACER alert() par notification
          this.notificationService.error(
            'Erreur de vérification',
            'Impossible de vérifier votre statut d\'abonnement.'
          );
        }
      });
    } else {
      // Pas connecté, rediriger vers Discord
      console.warn('Utilisateur non connecté, redirection vers Discord');
      // ✅ AJOUTER notification info
      this.notificationService.info(
        'Connexion requise',
        'Connectez-vous avec Discord pour continuer...'
      );
      localStorage.setItem('pendingPremium', '1');
      this.discordAuth.loginWithDiscord();
    }
  }

  private launchStripe(headers?: HttpHeaders) {
    this.isLoading = true;
    
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
    
    this.http.post<{ url: string }>(`${environment.apiUrl}/stripe/create-checkout-session`, {}, { 
      headers,
      withCredentials: true
    }).subscribe({
      next: (res) => {
        console.log('✅ Session Stripe créée:', res);
        // ✅ AJOUTER notification de succès
        this.notificationService.success(
          'Redirection...',
          'Redirection vers le paiement sécurisé Stripe.'
        );
        
        setTimeout(() => {
          window.location.href = res.url;
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Erreur Stripe:', error);
        this.isLoading = false;
        
        if (error.status === 403) {
          // ✅ REMPLACER alert() par notification
          this.notificationService.warning(
            'Déjà abonné !',
            'Vous êtes déjà Premium !'
          );
          this.router.navigate(['/dashboard']);
        } else {
          // ✅ REMPLACER alert() par notification
          this.notificationService.error(
            'Erreur de paiement',
            'Impossible de créer la session de paiement.'
          );
        }
      }
    });
  }

  // ✅ Garder ta méthode getCookie
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }
}

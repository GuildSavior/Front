import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { AuthService } from '../../../services/auth.service';
import { PlanService } from '../../../services/plan/plan.service'; // ✅ Nouveau service
import { User } from '../../../models/user.model';
import { Player } from '../../../models/player.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('250ms cubic-bezier(0.4,0.2,0.2,1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  showSensitive = false;
  userService = inject(UsersService);
  discordAuthService = inject(DiscordAuthService);
  authService = inject(AuthService);
  planService = inject(PlanService); // ✅ Injection du service
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  player: Player= {
    classe: 'dps',
    events_joined: 0
  };
  user: User = {
    id: 0,
    email: '',
    discord_id: '',
    avatar: '',
    statut: '',
    total_dkp: 0,
    created_at: '',
    updated_at: '',
    remember_token: null,
    username: null,
    refresh_token: null,
    guild_id: null,
    role_id: null,
    is_premium: false,
    subscription: null,
    guild: null,
    role: null
  };

  // 🆕 Notification pour l'activation du plan Premium
  notification: string | null = null;


  ngOnInit() {
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          
          // ✅ Log des infos Premium
          console.log('📊 Statut Premium:', this.planService.isPremiumActive(this.user));
          console.log('📅 Détails subscription:', this.planService.getSubscriptionDetails(this.user));
          
          // Traite les paramètres de paiement...
          this.route.queryParams.subscribe(params => {
            if (params['payment'] === 'success') {
              this.notification = 'Abonnement premium activé avec succès ! 🎉';
              this.router.navigate(['/dashboard'], { 
                queryParams: {},
                replaceUrl: true 
              });
            }
          });
        } else {
          localStorage.setItem('pendingDashboardSuccess', '1');
          this.discordAuthService.loginWithDiscord();
        }
      }
    });
  }

  // ✅ Méthodes helper pour le template
  isPremium(): boolean {
    return this.planService.isPremiumActive(this.user);
  }

  getSubscriptionInfo() {
    return this.planService.getSubscriptionDetails(this.user);
  }

  getPremiumBadgeClass(): string {
    return this.planService.getPremiumBadgeClass(this.user);
  }

  // ✅ Navigation vers la page guilde
  goToGuild() {
    this.router.navigate(['/guild']);
  }
}

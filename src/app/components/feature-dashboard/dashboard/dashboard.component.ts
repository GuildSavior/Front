import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Player } from '../../../models/player.model';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

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
export class DashboardComponent {
  showSensitive = false;
  userService = inject(UsersService);
  discordAuthService = inject(DiscordAuthService);
  authService = inject(AuthService); 
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
  };
  notification: string | null = null;

  player: Player = { classe: 'support' };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    // Vérifie si l'utilisateur est connecté via l'API (le cookie sera envoyé automatiquement)
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          
          // Traite les paramètres de paiement
          this.route.queryParams.subscribe(params => {
            if (params['payment'] === 'success') {
              this.notification = 'Abonnement premium activé avec succès ! 🎉';
              this.router.navigate([], { queryParams: {} });
            }
          });
        } else {
          // Pas connecté, on force le login Discord et on garde l'intention
          localStorage.setItem('pendingDashboardSuccess', '1');
          this.discordAuthService.loginWithDiscord();
        }
      }
    });
  }
}

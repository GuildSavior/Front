import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userService = inject(UsersService);
  discordAuthService = inject(DiscordAuthService);
  authService = inject(AuthService); 
  user: User = {
    id: 0,
    name: '',
    email: '',
    discord_id: '',
    avatar: '',
    statut: '',
    total_dkp: 0,
    created_at: '',
    updated_at: '',
    username: null,
    refresh_token: null,
    guild_id: null,
    role_id: null,
  };
  notification: string | null = null;

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

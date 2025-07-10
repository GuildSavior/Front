import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UsersService } from '../../../services/users/users.service';
import { AuthService } from '../../../services/auth.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  showDashboard = false;
  isAuthenticated = false;
  user: any = null;

  private userService = inject(UsersService);
  private authService = inject(AuthService);
  private discordAuthService = inject(DiscordAuthService);
  private router = inject(Router);

  ngOnInit() {
    this.checkAuthStatus();
  }

  // ✅ Fonction pour vérifier l'authentification
  checkAuthStatus() {
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.isAuthenticated = true;
          this.showDashboard = true;
          this.user = user;
          console.log('✅ Utilisateur connecté:', this.user);
        } else {
          this.isAuthenticated = false;
          this.showDashboard = false;
          this.user = null;
        }
      }
    });
  }

  // ✅ Fonction de login
  login() {
    this.discordAuthService.loginWithDiscord();
  }

  // ✅ Fonction de logout (délègue au service)
  logout() {
    this.authService.logout();
    // Met à jour l'état local
    this.isAuthenticated = false;
    this.showDashboard = false;
    this.user = null;
  }

  // ✅ Navigation vers le profil
  goToProfile() {
    this.router.navigate(['/profile']);
  }
}

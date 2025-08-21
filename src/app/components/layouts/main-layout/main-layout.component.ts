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
  isExpanded = false;
  isLoggingOut = false; // Ajout du loader

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
        } else {
          this.isAuthenticated = false;
          this.showDashboard = false;
          this.user = null;
        }
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  // ✅ Fonction de login
  login() {
    this.discordAuthService.loginWithDiscord();
  }

  // ✅ Fonction pour déplier la sidebar
  expandSidebar() {
    this.isExpanded = true;
  }

  // ✅ Fonction pour replier la sidebar
  collapseSidebar() {
    this.isExpanded = false;
  }

  // ✅ Fonction de logout (délègue au service)
  logout() {
    this.isLoggingOut = true;
    this.authService.logout();
    // Met à jour l'état local
    this.isAuthenticated = false;
    this.showDashboard = false;
    this.user = null;
    // Reset après un délai
    setTimeout(() => {
      this.isLoggingOut = false;
    }, 1000);
  }
}

import { Component, OnInit, inject, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.scss'
})
export class LandingLayoutComponent implements OnInit {
  isAuthenticated = false;
  user: any = null;
  showDropdown = false;
  avatarError = false;

  private discordAuth = inject(DiscordAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.checkAuthStatus();
  }

  // ✅ Vérifier l'authentification
  checkAuthStatus() {
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.isAuthenticated = true;
          this.user = user;
          this.avatarError = false;
          console.log('✅ Utilisateur connecté dans navbar:', this.user);
        } else {
          this.isAuthenticated = false;
          this.user = null;
          this.avatarError = false;
        }
      }
    });
  }

  // ✅ Construire l'URL de l'avatar Discord (très simple)
  getAvatarUrl(): string {
    return this.user?.avatar || '';
  }

  // ✅ Gérer l'erreur de chargement d'avatar
  onAvatarError(event: any) {
    console.log('❌ Erreur chargement avatar:', event);
    this.avatarError = true;
  }

  // ✅ Login Discord
  login(): void {
    this.discordAuth.loginWithDiscord();
  }

  // ✅ Logout
  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.user = null;
    this.showDropdown = false;
    this.avatarError = false;
  }

  // ✅ Toggle dropdown
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // ✅ Navigation
  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.showDropdown = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showDropdown = false;
  }

  // ✅ Fermer dropdown en cliquant ailleurs
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showDropdown = false;
    }
  }
}

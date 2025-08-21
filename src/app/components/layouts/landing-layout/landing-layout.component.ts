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
      next: (repsonse) => {
        if (repsonse) {
          this.isAuthenticated = true;
          this.user = repsonse.user;
          this.avatarError = false;
        } else {
          this.isAuthenticated = false;
          this.user = null;
          this.avatarError = false;
        }
      }
    });
  }

  // ✅ Gérer l'erreur de chargement d'avatar
  onAvatarError(event: any) {
    console.log('❌ Erreur chargement avatar:', event);
    this.avatarError = true;
  }

  // ✅ Login Discord (UN SEUL BOUTON)
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
  goToGuild() {
    this.router.navigate(['/guild']);
    this.showDropdown = false;
  }
  goToMembers() {
    this.router.navigate(['/members']);
    this.showDropdown = false;
  }
  goToAuctions() {
    this.router.navigate(['/auctions']);
    this.showDropdown = false;
  }
  goToEvents() {
    this.router.navigate(['/events']);
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

import { Component, Inject, inject, OnDestroy } from '@angular/core';
import { LoginService } from '../../../services/login/login.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

  discordAuth = inject(DiscordAuthService);
  router = inject(Router);
  auth = inject(AuthService)
  private logoutSubscription: Subscription | null = null;

  isLoggingOut = false; // Ajout du loader

  logout() {
    this.isLoggingOut = true;
    setTimeout(() => {
      this.isLoggingOut = false;
      this.discordAuth.logout();
      this.router.navigate(['/login']);
    }, 2500); // 2,5 secondes de loader
  }

  showDashboard = false;

  ngOnInit() {
    this.showDashboard = this.auth.isLoggedIn();
    console.log('showDashboard:', this.showDashboard);
  }
}

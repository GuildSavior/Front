import { Component, Inject, inject, OnDestroy } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  discordAuth = inject(DiscordAuthService);
  router = inject(Router);
  private logoutSubscription: Subscription | null = null;

  logout(){
    this.discordAuth.logout();
  }
}

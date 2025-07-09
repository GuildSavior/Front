import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.scss'
})
export class LandingLayoutComponent {

  private discordAuth = inject(DiscordAuthService);
  
    discordLog(): void {
      this.discordAuth.loginWithDiscord();
    }
}

import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent{

  private discordAuth = inject(DiscordAuthService);

  discordLog(): void {
    this.discordAuth.loginWithDiscord();
  }

}

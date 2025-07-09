import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';
import { UsersService } from '../../services/users/users.service';

@Component({
  selector: 'app-discord-auth-callback',
  standalone: true,
  imports: [RouterModule],
  template: ``,
  styleUrl: './discord-auth-callback.component.scss'
})
export class DiscordAuthCallbackComponent{ constructor(
  private authService: DiscordAuthService,
  private userService: UsersService,
  private route: ActivatedRoute,
  private router: Router
) {}

ngOnInit() {
  this.route.queryParams.subscribe(params => {
    if (params['token']) {
      const token = params['token'];
      const userId = params['id'];  // Récupère l'ID de l'utilisateur depuis l'URL
      console.log("Token:", token);
      console.log("User ID:", userId);

      // Sauvegarde le token dans localStorage
      localStorage.setItem('token', token);

      // Si tu veux aussi stocker l'ID utilisateur
      localStorage.setItem('userId', userId);

      // Redirige vers le dashboard ou une autre page
      this.router.navigate(['/dashboard']);
    }
  });
}

}


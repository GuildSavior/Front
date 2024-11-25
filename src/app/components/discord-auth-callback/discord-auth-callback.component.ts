import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';
import { UsersService } from '../../services/users/users.service';

@Component({
  selector: 'app-discord-auth-callback',
  standalone: true,
  imports: [],
  template: `<p>Connexion en cours...</p>`,
  styleUrl: './discord-auth-callback.component.scss'
})
export class DiscordAuthCallbackComponent{
  userService = inject(UsersService);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: DiscordAuthService
  ) {}

  ngOnInit(): void {
    // Utilisation de l'observable queryParams pour écouter les paramètres
    this.route.queryParams.subscribe(params => {
      const token = params['token']; // Récupère le token dans l'URL

      if (token) {
        // Sauvegarder le token dans le localStorage
        localStorage.setItem('jwt_token', token);
        console.log('Token JWT reçu:', token);

        this.userService.getUserInformation(token);

        // Rediriger vers la page protégée du tableau de bord
        this.router.navigate(['/dashboard']);
      } else {
        console.error('Token introuvable');
      }
    });
  }

  
}

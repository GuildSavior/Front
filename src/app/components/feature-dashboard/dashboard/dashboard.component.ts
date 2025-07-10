import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Player } from '../../../models/player.model';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('250ms cubic-bezier(0.4,0.2,0.2,1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class DashboardComponent {
  showSensitive = false;
  userService = inject(UsersService);
  authService = inject(DiscordAuthService)
  user: User = {
    id: 0,
    email: '',
    discord_id: '',
    avatar: '',
    statut: '',
    total_dkp: 0,
    created_at: '',
    updated_at: '',
    remember_token: null,
    username: null,
    refresh_token: null,
    guild_id: null,
    role_id: null,
  };
  player: Player = { classe: 'support' };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.userService.getUserInformation(token).subscribe((user: any) => {
        this.user = user.user; // Stocke l'utilisateur récupéré dans une variable
        console.log(user);
    });
}
}

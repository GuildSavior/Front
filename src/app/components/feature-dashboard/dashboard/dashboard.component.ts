import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  userService = inject(UsersService);
  authService = inject(DiscordAuthService)
  user: User = {
    id: 0,
    name: '',
    email: '',
    discord_id: '',
    avatar: '',
    statut: '',
    total_dkp: 0,
    created_at: '',
    updated_at: '',
    username: null,
    refresh_token: null,
    guild_id: null,
    role_id: null,
  };
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

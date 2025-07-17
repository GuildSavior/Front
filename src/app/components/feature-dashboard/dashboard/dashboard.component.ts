import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { AuthService } from '../../../services/auth.service';
import { PlanService } from '../../../services/plan/plan.service';
import { PlayerService } from '../../../services/player/player.service'; // ✅ AJOUTER
import { User } from '../../../models/user.model';
import { Player, PlayerClass } from '../../../models/player.model';
import { FormsModule } from '@angular/forms';

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
export class DashboardComponent implements OnInit {
  showSensitive = false;
  userService = inject(UsersService);
  discordAuthService = inject(DiscordAuthService);
  authService = inject(AuthService);
  planService = inject(PlanService);
  playerService = inject(PlayerService); // ✅ AJOUTER
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  // ✅ NOUVELLES propriétés pour le profil joueur
  hasPlayerProfile = false;
  isEditingPlayer = false;
  isSubmittingPlayer = false;
  
  // ✅ Formulaire joueur modifié
  playerForm: {
    name: string;
    level: number;
    class: PlayerClass;
  } = {
    name: '',
    level: 1,
    class: 'dps' // ✅ Par défaut DPS
  };

  // ✅ Profil joueur actuel
  currentPlayer: any = null;

  player: Player = {
    classe: 'dps',
    events_joined: 0
  };

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
    is_premium: false,
    subscription: null,
    guild: null,
    role: null
  };

  notification: string | null = null;

  ngOnInit() {
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          console.log('📊 Statut Premium:', this.planService.isPremiumActive(this.user));
          
          // ✅ Charger le profil joueur
          this.loadPlayerProfile();
          
          this.route.queryParams.subscribe(params => {
            if (params['payment'] === 'success') {
              this.notification = 'Abonnement premium activé avec succès ! 🎉';
              this.router.navigate(['/dashboard'], { 
                queryParams: {},
                replaceUrl: true 
              });
            }
          });
        } else {
          localStorage.setItem('pendingDashboardSuccess', '1');
          this.discordAuthService.loginWithDiscord();
        }
      }
    });
  }

  // ✅ NOUVELLES méthodes pour le profil joueur

  loadPlayerProfile() {
    this.playerService.getMyProfile().subscribe({
      next: (response) => {
        if (response.success && response.player) {
          this.currentPlayer = response.player;
          this.hasPlayerProfile = true;
          this.playerForm = {
            name: response.player.name,
            level: response.player.level,
            class: response.player.class // ✅ Récupère le rôle sauvegardé
          };
          // ✅ Synchroniser avec player.classe pour l'affichage
          this.player.classe = response.player.class;
          console.log('✅ Profil joueur chargé:', this.currentPlayer);
        } else {
          this.hasPlayerProfile = false;
          console.log('ℹ️ Aucun profil joueur trouvé');
        }
      },
      error: (error) => {
        this.hasPlayerProfile = false;
        console.log('ℹ️ Pas de profil joueur encore créé');
      }
    });
  }

  startEditPlayer() {
    this.isEditingPlayer = true;
    // ✅ Synchroniser le formulaire avec le profil actuel
    if (this.hasPlayerProfile) {
      this.playerForm.class = this.currentPlayer.class;
    }
  }

  cancelEditPlayer() {
    this.isEditingPlayer = false;
    if (this.hasPlayerProfile) {
      // Restaurer les valeurs originales
      this.playerForm = {
        name: this.currentPlayer.name,
        level: this.currentPlayer.level,
        class: this.currentPlayer.class // ✅ Restaurer le rôle original
      };
      this.player.classe = this.currentPlayer.class; // ✅ Synchroniser l'affichage
    } else {
      // Réinitialiser le formulaire
      this.playerForm = {
        name: '',
        level: 1,
        class: 'dps' // ✅ Par défaut DPS
      };
      this.player.classe = 'dps';
    }
  }

  savePlayerProfile() {
    if (!this.playerForm.name.trim()) {
      this.notification = '❌ Le nom du personnage est obligatoire';
      setTimeout(() => this.notification = null, 3000);
      return;
    }

    if (this.playerForm.level < 1 || this.playerForm.level > 100) {
      this.notification = '❌ Le niveau doit être entre 1 et 100';
      setTimeout(() => this.notification = null, 3000);
      return;
    }

    this.isSubmittingPlayer = true;

    // ✅ Envoyer les données avec le rôle comme classe
    this.playerService.createOrUpdateProfile(this.playerForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentPlayer = response.player;
          this.hasPlayerProfile = true;
          this.isEditingPlayer = false;
          
          // ✅ Synchroniser l'affichage avec la classe sauvegardée
          this.player.classe = this.playerForm.class;
          
          this.notification = `✅ ${response.message}`;
          setTimeout(() => this.notification = null, 4000);
          console.log('✅ Profil sauvegardé:', this.currentPlayer);
          console.log('✅ Rôle sauvegardé:', this.player.classe);
        }
        this.isSubmittingPlayer = false;
      },
      error: (error) => {
        console.error('❌ Erreur sauvegarde:', error);
        this.notification = error.error?.message || '❌ Erreur lors de la sauvegarde';
        setTimeout(() => this.notification = null, 4000);
        this.isSubmittingPlayer = false;
      }
    });
  }

  deletePlayerProfile() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre profil joueur ? Cette action est irréversible.')) {
      return;
    }

    this.playerService.deleteProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentPlayer = null;
          this.hasPlayerProfile = false;
          this.isEditingPlayer = false;
          this.playerForm = {
            name: '',
            level: 1,
            class: 'dps' // ✅ Par défaut DPS
          };
          this.player.classe = 'dps'; // ✅ Réinitialiser l'affichage
          this.notification = '✅ Profil joueur supprimé avec succès';
          setTimeout(() => this.notification = null, 4000);
        }
      },
      error: (error) => {
        console.error('❌ Erreur suppression:', error);
        this.notification = '❌ Erreur lors de la suppression';
        setTimeout(() => this.notification = null, 4000);
      }
    });
  }

  // ✅ Méthodes existantes...
  isPremium(): boolean {
    return this.planService.isPremiumActive(this.user);
  }

  getSubscriptionInfo() {
    return this.planService.getSubscriptionDetails(this.user);
  }

  getPremiumBadgeClass(): string {
    return this.planService.getPremiumBadgeClass(this.user);
  }

  goToGuild() {
    this.router.navigate(['/guild']);
  }
}

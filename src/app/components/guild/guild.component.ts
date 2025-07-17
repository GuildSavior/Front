import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GuildService } from '../../services/guild/guild.service'; // ✅ Nouveau service
import { PlanService } from '../../services/plan/plan.service'; // ✅ AJOUTER
import { User } from '../../models/user.model';
import { Guild } from '../../models/guild.model';
import { GuildInvitationService } from '../../services/invitations/guild-invitation.service';

@Component({
  selector: 'app-guild',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guild.component.html',
  styleUrl: './guild.component.scss'
})
export class GuildComponent implements OnInit {
  private authService = inject(AuthService);
  private guildService = inject(GuildService); // ✅ Service guild
  private planService = inject(PlanService); // ✅ Service plan
  private invitationService = inject(GuildInvitationService); // ✅ AJOUTER
  private router = inject(Router);

  user: User | null = null;
  guild: Guild | null = null;
  isCreatingGuild = false;
  isLoading = true;
  isSubmitting = false; // ✅ État de soumission
  errorMessage = ''; // ✅ Message d'erreur
  successMessage = ''; // ✅ Message de succès

  // ✅ Propriété pour la date actuelle
  currentDate = new Date().toLocaleDateString('fr-FR');

  // ✅ Formulaire de création de guilde
  newGuild: Guild = {
    name: '',
    description: ''
  };

  // ✅ NOUVELLES propriétés pour les invitations
  invitations: any[] = [];
  isLoadingInvitations = false;
  showInvitations = false;
  isCreatingInvitation = false;
  invitationForm = {
    maxUses: null as number | null,
    expiresInHours: null as number | null
  };

  // ✅ Propriété pour savoir si l'utilisateur est owner
  get isGuildOwner(): boolean {
    return !!(this.user && this.guild && this.guild.owner_id === this.user.id);
  }

  ngOnInit() {
    this.loadUserAndGuild();
  }

  loadUserAndGuild() {
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          
          // ✅ Récupérer la guilde actuelle de l'utilisateur
          this.guildService.getCurrentGuild().subscribe({
            next: (response) => {
              if (response.success) {
                this.guild = response.guild;
                console.log('✅ Guilde actuelle chargée:', this.guild);
              } else {
                console.log('ℹ️ Utilisateur sans guilde');
              }
              this.isLoading = false;
            },
            error: (error) => {
              if (error.status === 404) {
                console.log('ℹ️ Utilisateur sans guilde (404)');
              } else {
                console.error('❌ Erreur récupération guilde:', error);
              }
              this.isLoading = false;
            }
          });
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      }
    });
  }

  // ✅ Afficher le formulaire de création
  showCreateForm() {
    // ✅ Vérifier d'abord si l'utilisateur est Premium
    if (!this.planService.isPremiumActive(this.user!)) {
      this.errorMessage = 'Vous devez avoir un abonnement Premium pour créer une guilde.';
      // Optionnel : rediriger vers la page premium après 3 secondes
      setTimeout(() => {
        this.router.navigate(['/upgrade']);
      }, 3000);
      return;
    }

    this.isCreatingGuild = true;
    this.errorMessage = '';
    this.successMessage = '';
    // ✅ Met à jour la date quand on affiche le formulaire
    this.currentDate = new Date().toLocaleDateString('fr-FR');
  }

  // ✅ Annuler la création
  cancelCreate() {
    this.isCreatingGuild = false;
    this.newGuild = { name: '', description: '' };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ Créer la guilde avec appel API
  createGuild() {
    if (!this.newGuild.name.trim()) {
      this.errorMessage = 'Le nom de la guilde est obligatoire';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Préparer les données selon ton controller backend
    const guildData = {
      name: this.newGuild.name.trim(),
      description: this.newGuild.description.trim(),
      region: '' // Optionnel selon ton backend
    };

    console.log('🏰 Creating guild with data:', guildData);

    this.guildService.createGuild(guildData).subscribe({
      next: (response) => {
        console.log('✅ Guilde créée avec succès:', response);
        
        // ✅ Ton backend retourne { success: true, guild: {...} }
        if (response.success) {
          this.guild = response.guild;
          this.isCreatingGuild = false;
          this.isSubmitting = false;
          this.newGuild = { name: '', description: '' };
          this.successMessage = '🎉 Votre guilde a été créée avec succès !';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de la création';
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        this.isSubmitting = false;
        
        // ✅ Gestion des erreurs selon ton backend
        if (error.status === 403) {
          this.errorMessage = error.error.message || '🔒 Abonnement Premium requis pour créer une guilde';
          setTimeout(() => {
            this.router.navigate(['/upgrade']);
          }, 3000);
        } else if (error.status === 401) {
          this.errorMessage = '🔐 Veuillez vous reconnecter';
          this.router.navigate(['/home']);
        } else if (error.status === 422) {
          // Erreurs de validation
          const validationErrors = error.error.errors || {};
          this.errorMessage = Object.values(validationErrors).flat().join(', ');
        } else {
          this.errorMessage = error.error.message || '❌ Erreur lors de la création de la guilde. Veuillez réessayer.';
        }
      }
    });
  }

  // ✅ Vérifier si l'utilisateur peut créer une guilde
  canCreateGuild(): boolean {
    return this.user ? this.planService.isPremiumActive(this.user) : false;
  }

  // ✅ Retour au dashboard
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // ✅ Aller à la page upgrade
  goToUpgrade() {
    this.router.navigate(['/upgrade']);
  }

  // ✅ NOUVELLES méthodes pour les invitations

  loadInvitations() {
    if (!this.isGuildOwner) return;

    this.isLoadingInvitations = true;
    this.invitationService.getMyInvitations().subscribe({
      next: (response) => {
        if (response.success) {
          this.invitations = response.invitations;
          console.log('✅ Invitations chargées:', this.invitations);
        }
        this.isLoadingInvitations = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement invitations:', error);
        this.isLoadingInvitations = false;
      }
    });
  }

  toggleInvitations() {
    this.showInvitations = !this.showInvitations;
    if (this.showInvitations && this.invitations.length === 0) {
      this.loadInvitations();
    }
  }

  createInvitation() {
    this.isCreatingInvitation = true;
    this.errorMessage = '';

    this.invitationService.createInvitation(
      this.invitationForm.maxUses || undefined,
      this.invitationForm.expiresInHours || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '🔗 Invitation créée avec succès !';
          this.loadInvitations(); // Recharger la liste
          this.resetInvitationForm();
        }
        this.isCreatingInvitation = false;
      },
      error: (error) => {
        console.error('❌ Erreur création invitation:', error);
        this.errorMessage = error.error.message || 'Erreur lors de la création de l\'invitation';
        this.isCreatingInvitation = false;
      }
    });
  }

  copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      this.successMessage = '📋 URL copiée dans le presse-papiers !';
      setTimeout(() => this.successMessage = '', 3000);
    }).catch(() => {
      this.errorMessage = '❌ Impossible de copier l\'URL';
      setTimeout(() => this.errorMessage = '', 3000);
    });
  }

  deactivateInvitation(invitationId: number) {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette invitation ?')) {
      return;
    }

    this.invitationService.deactivateInvitation(invitationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '✅ Invitation désactivée';
          this.loadInvitations(); // Recharger la liste
        }
      },
      error: (error) => {
        console.error('❌ Erreur désactivation invitation:', error);
        this.errorMessage = 'Erreur lors de la désactivation';
      }
    });
  }

  private resetInvitationForm() {
    this.invitationForm = {
      maxUses: null,
      expiresInHours: null
    };
  }
}

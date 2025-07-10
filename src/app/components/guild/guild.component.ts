import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GuildService } from '../../services/guild/guild.service'; // ✅ Nouveau service
import { PlanService } from '../../services/plan/plan.service';
import { User } from '../../models/user.model';
import { Guild } from '../../models/guild.model';

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

  ngOnInit() {
    this.loadUserAndGuild();
  }

  loadUserAndGuild() {
    this.authService.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.guild = user.guild; // Si l'utilisateur a déjà une guilde
          this.isLoading = false;
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

    // ✅ Préparer les données pour l'API
    const guildData = {
      name: this.newGuild.name.trim(),
      description: this.newGuild.description.trim()
    };

    // ✅ Appel API pour créer la guilde
    this.guildService.createGuild(guildData).subscribe({
      next: (response) => {
        console.log('✅ Guilde créée avec succès:', response);
        
        // ✅ Succès - mettre à jour l'interface
        this.guild = response.guild; // Supposons que l'API retourne la guilde créée
        this.isCreatingGuild = false;
        this.isSubmitting = false;
        this.newGuild = { name: '', description: '' };
        this.successMessage = '🎉 Votre guilde a été créée avec succès !';
        
        // ✅ Effacer le message de succès après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        this.isSubmitting = false;
        
        // ✅ Gestion spécifique des erreurs Premium
        if (error.status === 403) {
          if (error.error.premium_required) {
            this.errorMessage = '🔒 Abonnement Premium requis pour créer une guilde';
            // Rediriger vers la page d'upgrade après 3 secondes
            setTimeout(() => {
              this.router.navigate(['/upgrade']);
            }, 3000);
          } else if (error.error.premium_expired) {
            this.errorMessage = '⏰ Votre abonnement Premium a expiré';
            setTimeout(() => {
              this.router.navigate(['/upgrade']);
            }, 3000);
          } else {
            this.errorMessage = '❌ Accès refusé pour cette action';
          }
        } else if (error.status === 401) {
          this.errorMessage = '🔐 Veuillez vous reconnecter';
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = '❌ Erreur lors de la création de la guilde. Veuillez réessayer.';
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
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GuildService } from '../../services/guild/guild.service';
import { PlanService } from '../../services/plan/plan.service';
import { User } from '../../models/user.model';
import { Guild } from '../../models/guild.model';
import { GuildInvitationService } from '../../services/invitations/guild-invitation.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-guild',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guild.component.html',
  styleUrl: './guild.component.scss'
})
export class GuildComponent implements OnInit {
  private authService = inject(AuthService);
  private guildService = inject(GuildService);
  private planService = inject(PlanService);
  private invitationService = inject(GuildInvitationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // ✅ Exposer l'environnement pour le template
  environment = environment;

  // ✅ État principal
  user: User | null = null;
  guild: Guild | null = null;
  isCreatingGuild = false;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isUpgrading = false; // ✅ Ajouter cette propriété

  // ✅ Propriété pour la date actuelle
  currentDate = new Date().toLocaleDateString('fr-FR');

  // ✅ Formulaire de création de guilde
  newGuild: Guild = {
    name: '',
    description: ''
  };

  // ✅ États des invitations
  invitations: any[] = [];
  isLoadingInvitations = false;
  showInvitations = false;
  isCreatingInvitation = false;
  invitationForm = {
    maxUses: null as number | null,
    expiresInHours: null as number | null
  };

  private notificationService = inject(NotificationService);

  // ✅ Propriété pour savoir si l'utilisateur est owner
  get isGuildOwner(): boolean {
    if (!this.user || !this.guild) {
      return false;
    }
    
    const userId = Number(this.user.id);
    const ownerId = Number(this.guild.owner_id);
    const result = userId === ownerId;
    
    if (environment.enableDebugLogs) {
      console.log('🔧 isGuildOwner check:', {
        userId,
        ownerId,
        result
      });
    }
    
    return result;
  }

  ngOnInit() {
    if (environment.enableDebugLogs) {
      console.log('🔧 GuildComponent - Initialisation');
    }
    this.loadUserAndGuild();
  }
  

  // ✅ CHARGEMENT INITIAL
  loadUserAndGuild() {
    this.authService.checkAuthStatus().subscribe({
      next: (response) => {
        if (response) {
          this.user = response.user;
          
          if (environment.enableDebugLogs) {
            console.log('🔧 Guild - Utilisateur chargé:', this.user);
          }
          
          this.guildService.getCurrentGuild().subscribe({
            next: (response) => {
              if (response.success) {
                this.guild = response.guild;
                if (environment.enableDebugLogs) {
                  console.log('✅ Guilde actuelle chargée:', this.guild);
                }
              } else {
                if (environment.enableDebugLogs) {
                  console.log('ℹ️ Utilisateur sans guilde');
                }
              }
              this.isLoading = false;
            },
            error: (error) => {
              if (error.status === 404) {
                if (environment.enableDebugLogs) {
                  console.log('ℹ️ Utilisateur sans guilde (404)');
                }
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

  // ✅ GESTION CRÉATION DE GUILDE
  showCreateForm() {
    if (!this.planService.isPremiumActive(this.user!)) {
      this.notificationService.error(
        'Abonnement Premium requis',
        'Vous devez avoir un abonnement Premium pour créer une guilde.'
      );
    }

    this.isCreatingGuild = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.currentDate = new Date().toLocaleDateString('fr-FR');
  }

  cancelCreate() {
    this.isCreatingGuild = false;
    this.newGuild = { name: '', description: '' };
    this.errorMessage = '';
    this.successMessage = '';
  }

  createGuild() {
    if (!this.newGuild.name.trim()) {
      this.notificationService.error(
        'Erreur de création',
        'Le nom de la guilde est obligatoire.'
      );
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const guildData = {
      name: this.newGuild.name.trim(),
      description: this.newGuild.description.trim(),
      region: ''
    };

    if (environment.enableDebugLogs) {
      console.log('🏰 Creating guild with data:', guildData);
    }

    this.guildService.createGuild(guildData).subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Guilde créée avec succès:', response);
        }
        
        if (response.success) {
          this.guild = response.guild;
          this.isCreatingGuild = false;
          this.isSubmitting = false;
          this.newGuild = { name: '', description: '' };
          this.notificationService.success(
            'Guilde créée',
            '🎉 Votre guilde a été créée avec succès !'
          );
        } else {
          this.notificationService.error(
            'Erreur de création',
            response.message || 'Erreur lors de la création'
          );
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 403) {
          this.notificationService.error(
            'Erreur d\'accès',
            error.error.message || '🔒 Abonnement Premium requis pour créer une guilde'
          );
          setTimeout(() => {
            this.router.navigate(['/upgrade']);
          }, 3000);
        } else if (error.status === 401) {
          this.notificationService.error(
            'Erreur d\'authentification',
            '🔐 Veuillez vous reconnecter'
          );
          this.router.navigate(['/home']);
        } else if (error.status === 422) {
          const validationErrors = error.error.errors || {};
          this.notificationService.error(
            'Erreur de validation',
            Object.values(validationErrors).flat().join(', ')
          );
        } else {
          this.notificationService.error(
            'Erreur inconnue',
            error.error.message || '❌ Erreur lors de la création de la guilde. Veuillez réessayer.'
          );
        }
      }
    });
  }

  // ✅ UTILITAIRES
  canCreateGuild(): boolean {
    return this.user ? this.planService.isPremiumActive(this.user) : false;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToUpgrade() {
    this.router.navigate(['/upgrade']);
  }

  // ✅ GESTION DES INVITATIONS
  loadInvitations() {
    if (!this.guild || !this.isGuildOwner) {
      if (environment.enableDebugLogs) {
        console.log('❌ Impossible de charger les invitations: pas propriétaire ou pas de guilde');
      }
      return;
    }

    this.isLoadingInvitations = true;
    
    this.invitationService.getMyInvitations().subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse invitations:', response);
        }

        if (response.success) {
          this.invitations = response.invitations || [];
          if (environment.enableDebugLogs) {
            console.log('✅ Invitations chargées:', this.invitations.length);
          }
        } else {
          this.invitations = [];
        }
        
        this.isLoadingInvitations = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement invitations:', error);
        this.isLoadingInvitations = false;
        this.invitations = [];
        
        if (error.status === 403) {
          this.notificationService.error(
            'Erreur d\'accès',
            'Vous ne possédez aucune guilde.'
          );
        }
      }
    });
  }

  toggleInvitations() {
    if (!this.isGuildOwner) {
      this.notificationService.error(
        'Erreur d\'accès',
        'Seul le propriétaire de la guilde peut gérer les invitations.'
      );
      return;
    }

    this.showInvitations = !this.showInvitations;
    
    if (this.showInvitations && this.invitations.length === 0) {
      this.loadInvitations();
    }

    if (environment.enableDebugLogs) {
      console.log('🔗 Toggle invitations:', this.showInvitations);
    }
  }

  // ✅ SIMPLIFIER la méthode createInvitation pour debug
  createInvitation() {
    if (!this.guild || !this.isGuildOwner) {
      this.notificationService.error(
        'Erreur d\'accès',
        'Vous devez être propriétaire d\'une guilde pour créer des invitations.'
      );
      return;
    }

    this.isCreatingInvitation = true;
    this.errorMessage = '';
    this.successMessage = '';

    const invitationData: any = {};
    
    if (this.invitationForm.maxUses && this.invitationForm.maxUses > 0) {
      invitationData.max_uses = this.invitationForm.maxUses;
    }
    
    if (this.invitationForm.expiresInHours && this.invitationForm.expiresInHours > 0) {
      invitationData.expires_in_hours = this.invitationForm.expiresInHours;
    }

    if (environment.enableDebugLogs) {
      console.log('🔗 Création invitation avec données:', invitationData);
    }

    this.invitationService.createInvitation(invitationData).subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse COMPLÈTE du serveur:', response);
          console.log('✅ Invitation reçue:', response.invitation);
        }

        if (response.success) {
          // ✅ SIMPLE: Recharger toute la liste au lieu de manipuler
          this.loadInvitations();
          
          this.invitationForm = { 
            maxUses: null, 
            expiresInHours: null 
          };
          this.notificationService.success(
            'Invitation créée avec succès',
            `✅ ${response.message}`
          );
        } else {
          this.notificationService.error(
            'Erreur de création',
            response.message || 'Erreur lors de la création de l\'invitation'
          );
        }
        
        this.isCreatingInvitation = false;
      },
      error: (error) => {
        this.isCreatingInvitation = false;
        
        if (error.status === 403) {
          this.notificationService.error(
            'Erreur d\'accès',
            'Vous ne possédez aucune guilde.'
          );
        } else if (error.status === 422) {
          const validationErrors = error.error?.errors || {};
          this.notificationService.error(
            'Erreur de validation',
            Object.values(validationErrors).flat().join(', ')
          );
        } else if (error.status === 500) {
          this.notificationService.error(
            'Erreur serveur',
            'Erreur serveur lors de la création de l\'invitation'
          );
        } else {
          this.notificationService.error(
            'Erreur inconnue',
            error.error?.message || 'Erreur lors de la création de l\'invitation'
          );
        }
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    });
  }

  // ✅ CLIPBOARD
  copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        this.notificationService.success(
          'Copié dans le presse-papier !',
          this.successMessage = '📋 Copié dans le presse-papier !'
        );
      }).catch((error) => {
        this.fallbackCopyToClipboard(text);
      });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.notificationService.success(
        'Copié dans le presse-papier !',
        this.successMessage = '📋 Copié dans le presse-papier !'
      );
    } catch (error) {
      console.error('Erreur fallback copy:', error);
      this.notificationService.error(
        'Erreur de copie',
        '❌ Impossible de copier le texte. Essayez manuellement.'
      );
    }
    
    document.body.removeChild(textArea);
  }

  // ✅ GESTION INVITATIONS - VERSION FINALE (plus de doublons)
  deactivateInvitation(invitationId: number) {
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    if (!invitation) {
      return;
    }

    const confirmMessage = `Désactiver cette invitation ?\n\nCode: ${invitation.code}\n\nElle restera visible mais ne fonctionnera plus.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    if (environment.enableDebugLogs) {
      console.log('⏸️ Désactivation invitation ID:', invitationId);
    }

    this.invitationService.deactivateInvitation(invitationId).subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse désactivation:', response);
        }

        if (response.success) {
          const index = this.invitations.findIndex(inv => inv.id === invitationId);
          if (index !== -1) {
            this.invitations[index].is_active = false;
            this.invitations[index].is_valid = false;
          }
          this.notificationService.success(
            'Invitation désactivée',
            `⏸️ ${response.message}`
          );
        } else {
          this.notificationService.error(
            'Erreur de désactivation',
            response.message || 'Erreur lors de la désactivation'
          );
        }
      },
      error: (error) => {
        
        if (error.status === 403) {
          this.notificationService.error(
            'Erreur de désactivation',
            this.errorMessage = 'Vous ne possédez aucune guilde.'
          );
        } else if (error.status === 404) {
          this.notificationService.error(
            'Erreur de désactivation',
            this.errorMessage = 'Invitation introuvable.'
          );
        } else {
          this.notificationService.error(
            'Erreur de désactivation',
            this.errorMessage = error.error?.message || 'Erreur lors de la désactivation'
          );
        }
        
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  deleteInvitation(invitationId: number) {
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    if (!invitation) {
      return;
    }

    const status = invitation.is_active ? 'active' : 'inactive';
    const confirmMessage = `Supprimer définitivement cette invitation ${status} ?\n\nCode: ${invitation.code}\n\n⚠️ Cette action est irréversible !`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    if (environment.enableDebugLogs) {
      console.log('🗑️ Suppression invitation ID:', invitationId);
    }

    this.invitationService.deleteInvitation(invitationId).subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse suppression:', response);
        }

        if (response.success) {
          this.invitations = this.invitations.filter(inv => inv.id !== invitationId);
          
          this.notificationService.success(
            'Invitation supprimée',
            `🗑️ ${response.message}`
          );
        } else {
          this.notificationService.error(
            'Erreur de suppression',
            response.message || 'Erreur lors de la suppression'
          );
        }
      },
      error: (error) => {
        console.error('❌ Erreur suppression invitation:', error);
        
        if (error.status === 403) {
          this.errorMessage = 'Vous ne possédez aucune guilde.';
        } else if (error.status === 404) {
          this.errorMessage = 'Invitation introuvable.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
        }
        
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  cleanupInactiveInvitations() {
    const inactiveInvitations = this.invitations.filter(inv => !inv.is_active || !inv.is_valid);
    
    if (inactiveInvitations.length === 0) {
      this.errorMessage = 'Aucune invitation inactive à nettoyer.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const confirmMessage = `Supprimer définitivement toutes les invitations inactives ?\n\n${inactiveInvitations.length} invitation(s) seront supprimées pour toujours.\n\n⚠️ Cette action est irréversible !`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.invitationService.cleanupInactiveInvitations().subscribe({
      next: (response) => {
        if (response.success) {
          this.invitations = this.invitations.filter(inv => inv.is_active && inv.is_valid);
          
          this.successMessage = `🧹 ${response.message}`;
          setTimeout(() => this.successMessage = '', 4000);
        } else {
          this.errorMessage = response.message || 'Erreur lors du nettoyage';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('❌ Erreur nettoyage invitations:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du nettoyage';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ✅ HELPER METHODS
  getInactiveInvitationsCount(): number {
    return this.invitations.filter(inv => !inv.is_active || !inv.is_valid).length;
  }

  trackByInvitationId(index: number, invitation: any): number {
    return invitation.id;
  }

  // ✅ GESTION GUILDE
  showGuildSettings() {
    this.successMessage = '⚙️ Paramètres de guilde - Fonctionnalité à venir !';
    setTimeout(() => this.successMessage = '', 3000);
    
    if (environment.enableDebugLogs) {
      console.log('⚙️ Paramètres guilde demandés');
    }
  }

  leaveGuild() {
    if (!this.guild) {
      return;
    }

    const confirmMessage = `Êtes-vous sûr de vouloir quitter la guilde "${this.guild.name}" ?\n\nCette action est irréversible.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    if (environment.enableDebugLogs) {
      console.log('🚪 Tentative de quitter la guilde:', this.guild.name);
    }

    if (this.isGuildOwner) {
      this.errorMessage = '❌ Vous ne pouvez pas quitter votre propre guilde. Supprimez-la ou transférez la propriété d\'abord.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.guildService.leaveGuild().subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse quitter guilde:', response);
        }

        if (response.success) {
          this.successMessage = `✅ ${response.message || 'Vous avez quitté la guilde avec succès'}`;
          
          this.guild = null;
          this.user = null;
          this.invitations = [];
          this.showInvitations = false;
          
          setTimeout(() => {
            this.loadUserAndGuild();
            this.successMessage = '';
          }, 2000);
          
        } else {
          this.errorMessage = response.message || 'Erreur lors de la sortie de la guilde';
        }
        
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Erreur quitter guilde:', error);
        this.isSubmitting = false;
        
        if (error.status === 403) {
          this.errorMessage = error.error?.message || 'Vous n\'êtes pas membre d\'une guilde.';
        } else if (error.status === 404) {
          this.errorMessage = 'Guilde introuvable.';
        } else if (error.status === 422) {
          this.errorMessage = error.error?.message || 'Impossible de quitter la guilde.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de la sortie de la guilde';
        }
        
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  disbandGuild() {
    if (!this.guild || !this.isGuildOwner) {
      this.errorMessage = '❌ Seul le propriétaire peut dissoudre la guilde.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const firstConfirm = confirm(
      `⚠️ ATTENTION ! Vous êtes sur le point de DISSOUDRE définitivement la guilde "${this.guild.name}".\n\n` +
      `Cette action va :\n` +
      `• Supprimer la guilde définitivement\n` +
      `• Expulser tous les membres (${this.guild.member_count} membre(s))\n` +
      `• Supprimer toutes les invitations\n` +
      `• Effacer tout l'historique de la guilde\n\n` +
      `⚠️ CETTE ACTION EST IRRÉVERSIBLE !\n\n` +
      `Voulez-vous vraiment continuer ?`
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = confirm(
      `🔥 DERNIÈRE CHANCE !\n\n` +
      `Tapez "DISSOUDRE" dans la prochaine fenêtre pour confirmer la dissolution de "${this.guild.name}".`
    );

    if (!secondConfirm) {
      return;
    }

    const finalConfirmation = prompt(
      `Pour confirmer la dissolution définitive de la guilde "${this.guild.name}", tapez exactement :\n\nDISSOUDRE`
    );

    if (finalConfirmation !== 'DISSOUDRE') {
      this.errorMessage = '❌ Dissolution annulée. Le texte de confirmation ne correspond pas.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    if (environment.enableDebugLogs) {
      console.log('💥 Dissolution de la guilde confirmée:', this.guild.name);
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.guildService.disbandGuild().subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse dissolution guilde:', response);
        }

        if (response.success) {
          this.successMessage = `💥 ${response.message || 'La guilde a été dissoute avec succès'}`;
          
          const dissolvedGuildName = this.guild?.name;
          this.guild = null;
          this.user = null;
          this.invitations = [];
          this.showInvitations = false;
          
          setTimeout(() => {
            this.successMessage = `✅ La guilde "${dissolvedGuildName}" a été dissoute. Vous allez être redirigé...`;
            
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          }, 3000);
          
        } else {
          this.errorMessage = response.message || 'Erreur lors de la dissolution de la guilde';
        }
        
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Erreur dissolution guilde:', error);
        this.isSubmitting = false;
        
        if (error.status === 403) {
          this.errorMessage = error.error?.message || 'Vous n\'êtes pas autorisé à dissoudre cette guilde.';
        } else if (error.status === 404) {
          this.errorMessage = 'Guilde introuvable.';
        } else if (error.status === 422) {
          this.errorMessage = error.error?.message || 'Impossible de dissoudre la guilde.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de la dissolution de la guilde';
        }
        
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  // ✅ AJOUTER dans guild.component.ts
  upgradeToPremium() {
    console.log("Lancement de l'achat premium depuis la page guilde");
    
    this.isUpgrading = true;
    
    const token = this.getCookie('auth_token');
    
    if (!token) {
      console.warn('Utilisateur non connecté, redirection vers Discord');
      localStorage.setItem('pendingPremium', '1');
      
      // ✅ Option 1: Si tu as accès au service Discord
      // this.discordAuth.loginWithDiscord();
      
      // ✅ Option 2: Redirection vers la page d'accueil
      this.router.navigate(['/home']);
      
      this.isUpgrading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log("Utilisateur connecté, lancement de Stripe");
    this.launchStripe(headers);
  }

  // ✅ AJOUTER cette méthode dans guild.component.ts
  private launchStripe(headers: HttpHeaders) {
    // ✅ Utiliser environment.apiUrl
    this.http.post<{ url: string }>(`${environment.apiUrl}/stripe/create-checkout-session`, {}, { 
      headers,
      withCredentials: true
    }).subscribe({
      next: (response) => {
        if (response.url) {
          console.log('✅ Session Stripe créée, redirection...');
          
          // ✅ Optionnel: Message de feedback
          this.successMessage = '🚀 Redirection vers le paiement sécurisé...';
          
          // Redirection vers Stripe
          window.location.href = response.url;
        } else {
          console.error('❌ Pas d\'URL de redirection dans la réponse Stripe');
          this.errorMessage = 'Erreur lors de la création de la session de paiement.';
          this.isUpgrading = false;
        }
      },
      error: (error) => {
        console.error('❌ Erreur Stripe:', error);
        this.errorMessage = 'Erreur lors de la connexion au service de paiement.';
        this.isUpgrading = false;
        
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  // ✅ AJOUTER getCookie si pas déjà fait
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }
}

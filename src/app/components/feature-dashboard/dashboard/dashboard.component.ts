import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UsersService } from '../../../services/users/users.service';
import { DiscordAuthService } from '../../../services/discordAuth/discord-auth.service';
import { AuthService } from '../../../services/auth.service';
import { PlanService } from '../../../services/plan/plan.service';
import { PlayerService } from '../../../services/player/player.service';
import { User } from '../../../models/user.model'; // ✅ CORRIGER le chemin
import { Player, PlayerClass } from '../../../models/player.model'; // ✅ CORRIGER le chemin
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../services/notification/notification.service';
import { GalleryService, UserImage } from '../../../services/gallery/gallery.service';

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
  playerService = inject(PlayerService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  galleryService = inject(GalleryService);
  
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
    class: 'dps'
  };

  // ✅ Profil joueur actuel
  currentPlayer: any = null;

  player: Player = {
    classe: 'dps',
    events_joined: 0
  };

  // ✅ CORRIGER: Utiliser null au lieu d'un objet vide
  user: User | null = null;
  notification: string | null = null;
  isLoading = true; // ✅ AJOUTER pour l'état de chargement
  environment: any;

  // ✅ NOUVEAU: Propriété pour l'upgrade
  isUpgrading = false;

  // ✅ NOUVELLES propriétés pour la galerie
  userImages: UserImage[] = [];
  isLoadingGallery = false;
  galleryViewMode: 'grid' | 'list' = 'grid';
  
  // Modal upload
  showUploadModal = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragOver = false;
  isUploading = false;
  
  uploadForm = {
    title: '',
    description: '',
    isPublic: true
  };
  
  // Modal image
  showImageModal = false;
  selectedImage: UserImage | null = null;

  private notificationService = inject(NotificationService);
  ngOnInit() {
    // ✅ Debug en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 DashboardComponent - Initialisation');
    }

    // ✅ AFFICHER l'environnement actuel
    console.log('🌍 ENVIRONNEMENT ACTUEL:', environment.environmentName);
    console.log('🌍 API URL:', environment.apiUrl);
    console.log('🌍 Production:', environment.production);
    console.log('🌍 Debug activé:', environment.enableDebugLogs);
    
    // ✅ Vérifier d'abord si on est connecté
    if (!this.authService.isLoggedIn()) {
      if (environment.enableDebugLogs) {
        console.log('🔧 Dashboard - Utilisateur non connecté, redirection vers Discord');
      }
      localStorage.setItem('pendingDashboardSuccess', '1');
      this.discordAuthService.loginWithDiscord();
      return;
    }

    // ✅ CORRIGER: Extraire user depuis la réponse API
    this.userService.getUserInformation().subscribe({
      next: (response: any) => {
        if (environment.enableDebugLogs) {
          console.log('🔧 Dashboard - Réponse API complète:', response);
          console.log('🔧 Status:', response.status);
          console.log('🔧 User dans la réponse:', response.user);
        }

        // ✅ CORRIGER: Extraire l'utilisateur depuis response.user
        if (response.status === 'success' && response.user) {
          this.user = response.user; // ✅ UTILISER response.user au lieu de response
          
          if (environment.enableDebugLogs) {
            console.log('🔧 Username:', this.user?.username);
            console.log('🔧 Avatar:', this.user?.avatar);
            console.log('🔧 Discord ID:', this.user?.discord_id);
            console.log('🔧 Is Premium:', this.user?.is_premium);
            console.log('🔧 Guild ID:', this.user?.guild_id);
          }
        } else {
          console.error('❌ Structure de réponse inattendue:', response);
          this.user = null;
        }
        
        this.isLoading = false;
        
        // ✅ FORCER le changement de détection
        setTimeout(() => {
          if (environment.enableDebugLogs) {
            console.log('🔧 this.user final:', this.user);
            console.log('🔧 this.userName getter:', this.userName);
            console.log('🔧 this.userAvatar getter:', this.userAvatar);
          }
        }, 100);
        
        this.loadPlayerProfile();
        this.handleQueryParams();
        this.loadGallery();
      },
      error: (error) => {
        console.error('❌ Erreur récupération utilisateur:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ Error complet:', error);
        
        this.isLoading = false;
        
        if (error.status === 401 || error.status === 403) {
          if (environment.enableDebugLogs) {
            console.log('🔧 Dashboard - Token invalide, redirection vers Discord');
          }
          localStorage.setItem('pendingDashboardSuccess', '1');
          this.discordAuthService.loginWithDiscord();
        } else {
          this.notification = '❌ Erreur lors du chargement des données';
          setTimeout(() => this.notification = null, 4000);
        }
      }
    });
  }

  // ✅ NOUVELLE méthode pour gérer les paramètres de requête
  private handleQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['payment'] === 'success') {
        this.notification = 'Abonnement premium activé avec succès ! 🎉';
        // Nettoyer l'URL sans recharger la page
        this.router.navigate(['/dashboard'], { 
          queryParams: {},
          replaceUrl: true 
        });
        setTimeout(() => this.notification = null, 5000);
      }
      
      if (params['loginSuccess'] === '1') {
        this.notification = 'Connexion réussie ! Bienvenue 👋';
        this.router.navigate(['/dashboard'], { 
          queryParams: {},
          replaceUrl: true 
        });
        setTimeout(() => this.notification = null, 4000);
      }
    });
  }

  // ✅ Charger le profil joueur
  loadPlayerProfile() {
    if (environment.enableDebugLogs) {
      console.log('🔧 Dashboard - Chargement du profil joueur');
    }

    this.playerService.getMyProfile().subscribe({
      next: (response) => {
        if (response.success && response.player) {
          this.currentPlayer = response.player;
          this.hasPlayerProfile = true;
          this.playerForm = {
            name: response.player.name,
            level: response.player.level,
            class: response.player.class
          };
          this.player.classe = response.player.class;
          
          if (environment.enableDebugLogs) {
            console.log('✅ Profil joueur chargé:', this.currentPlayer);
          }
        } else {
          this.hasPlayerProfile = false;
          if (environment.enableDebugLogs) {
            console.log('ℹ️ Aucun profil joueur trouvé');
          }
        }
      },
      error: (error) => {
        this.hasPlayerProfile = false;
        if (environment.enableDebugLogs) {
          console.log('ℹ️ Pas de profil joueur encore créé');
        }
      }
    });
  }

  // ✅ NOUVELLE méthode pour charger la galerie
  loadGallery() {
    this.isLoadingGallery = true;
    
    this.galleryService.getMyImages().subscribe({
      next: (response) => {
        if (response.success) {
          this.userImages = response.images;
          console.log('✅ Galerie chargée:', this.userImages.length, 'images');
        }
        this.isLoadingGallery = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement galerie:', error);
        this.notificationService.error(
          'Erreur galerie',
          'Impossible de charger votre galerie'
        );
        this.isLoadingGallery = false;
      }
    });
  }

  startEditPlayer() {
    this.isEditingPlayer = true;
    if (this.hasPlayerProfile && this.currentPlayer) {
      this.playerForm = {
        name: this.currentPlayer.name,
        level: this.currentPlayer.level,
        class: this.currentPlayer.class
      };
    }
  }

  cancelEditPlayer() {
    this.isEditingPlayer = false;
    if (this.hasPlayerProfile && this.currentPlayer) {
      this.playerForm = {
        name: this.currentPlayer.name,
        level: this.currentPlayer.level,
        class: this.currentPlayer.class
      };
      this.player.classe = this.currentPlayer.class;
    } else {
      this.playerForm = {
        name: '',
        level: 1,
        class: 'dps'
      };
      this.player.classe = 'dps';
    }
  }

  savePlayerProfile() {
    if (!this.playerForm.name.trim()) {
      this.notificationService.error(
        'Erreur de validation',
        '❌ Le nom du personnage est obligatoire'
      );
      return;
    }

    if (this.playerForm.level < 1 || this.playerForm.level > 55) {
      this.notificationService.error(
        'Erreur de validation',
        '❌ Le niveau doit être entre 1 et 55'
      );
      return;
    }

    this.isSubmittingPlayer = true;

    this.playerService.createOrUpdateProfile(this.playerForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentPlayer = response.player;
          this.hasPlayerProfile = true;
          this.isEditingPlayer = false;
          this.player.classe = this.playerForm.class;

          this.notificationService.success(
            'Profil sauvegardé',
            `✅ ${response.message}`
          );

          if (environment.enableDebugLogs) {
            console.log('✅ Profil sauvegardé:', this.currentPlayer);
          }
        }
        this.isSubmittingPlayer = false;
      },
      error: (error) => {
        console.error('❌ Erreur sauvegarde:', error);
        this.notificationService.error(
          'Erreur de sauvegarde',
          error.error?.message || '❌ Erreur lors de la sauvegarde'
        );
        this.isSubmittingPlayer = false;
      }
    });
  }

  deletePlayerProfile() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre profil joueur ? Cette action est irréversible. VOUS PERDREZ TOUT VOS DKP !')) {
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
            class: 'dps'
          };
          this.player.classe = 'dps';
          this.notificationService.success(
            'Profil supprimé',
            '✅ Votre profil joueur a été supprimé avec succès'
          );
        }
      },
      error: (error) => {
        console.error('❌ Erreur suppression:', error);
        this.notificationService.error(
          'Erreur de suppression',
          error.error?.message || '❌ Erreur lors de la suppression du profil joueur'
        );
      }
    });
  }

  // ✅ CORRIGER les méthodes existantes pour vérifier si user existe
  isPremium(): boolean {
    if (!this.user) return false;
    return this.planService.isPremiumActive(this.user);
  }

  getSubscriptionInfo() {
    if (!this.user) return null;
    return this.planService.getSubscriptionDetails(this.user);
  }

  getPremiumBadgeClass(): string {
    if (!this.user) return '';
    return this.planService.getPremiumBadgeClass(this.user);
  }

  goToGuild() {
    this.router.navigate(['/guild']);
  }

  // ✅ AJOUTER des getters pour le template
  get userName(): string {
    const name = this.user?.username || 'Utilisateur';
    if (environment.enableDebugLogs) {
      console.log('🔧 userName getter appelé, user:', this.user, 'name:', name);
    }
    return name;
  }

  get userAvatar(): string {
    const avatar = this.user?.avatar || '/assets/default-avatar.png';
    if (environment.enableDebugLogs) {
      console.log('🔧 userAvatar getter appelé, user:', this.user, 'avatar:', avatar);
    }
    return avatar;
  }

  get totalDkp(): number {
    const dkp = this.user?.total_dkp || 0;
    if (environment.enableDebugLogs) {
      console.log('🔧 totalDkp getter appelé, user:', this.user, 'dkp:', dkp);
    }
    return dkp;
  }

  get hasGuild(): boolean {
    const hasGuild = !!this.user?.guild_id;
    if (environment.enableDebugLogs) {
      console.log('🔧 hasGuild getter appelé, user:', this.user, 'hasGuild:', hasGuild);
    }
    return hasGuild;
  }

  // ✅ AJOUTER méthode de déconnexion
  logout() {
    if (environment.enableDebugLogs) {
      console.log('🔧 Dashboard - Déconnexion demandée');
    }
    
    // ✅ Plus besoin de logoutAndRedirect(), juste logout()
    this.authService.logout();
  }

  // ✅ NOUVEAU: Méthode upgradeToPremium (identique à guild)
  upgradeToPremium() {
    
    this.isUpgrading = true;
    
    const token = this.getCookie('auth_token');
    
    if (!token) {
      console.warn('Utilisateur non connecté, redirection vers Discord');
      localStorage.setItem('pendingPremium', '1');
      
      // Redirection vers la page d'accueil pour se connecter
      this.router.navigate(['/home']);
      
      this.isUpgrading = false;
      return;
    }
    this.launchStripe();
  }

  // ✅ NOUVEAU: Méthode pour lancer Stripe
  private launchStripe() {
    const token = this.getCookie('auth_token');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // ✅ Utiliser fetch au lieu de HttpClient pour éviter les imports
    fetch(`${environment.apiUrl}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
      if (data.url) {
        this.notificationService.success(
          'Session Stripe créée',
          '✅ Redirection vers le paiement sécurisé...'
        );

        // Redirection vers Stripe
        window.location.href = data.url;
      } else {
        console.error('❌ Pas d\'URL de redirection dans la réponse Stripe');
        this.notificationService.error(
          'Erreur de création de session',
          '❌ Erreur lors de la création de la session de paiement.'
        );
        this.isUpgrading = false;
      }
    })
    .catch(error => {
      console.error('❌ Erreur Stripe:', error);
      this.notificationService.error(
        'Erreur de connexion',
        '❌ Erreur lors de la connexion au service de paiement.'
      );
      this.isUpgrading = false;
    });
  }

  // ✅ NOUVEAU: Méthode getCookie
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Méthode pour obtenir le nom d'affichage de la classe
  getClassDisplayName(classKey: string): string {
    const classNames: { [key: string]: string } = {
      'tank': '🛡️ Tank',
      'dps': '⚔️ DPS', 
      'support': '🩹 Support',
      'range': '🏹 Range',
      'mage': '🔮 Mage'
    };
    return classNames[classKey] || classKey;
  }

  // Méthodes de navigation (à adapter selon tes routes)
  goToEvents() {
    this.router.navigate(['/events']);
  }

  goToSettings() {
    this.router.navigate(['/auctions']);
  }

  // ✅ Calculer le niveau de participation (0-100%)
  getParticipationLevel(): number {
    if (!this.currentPlayer) return 0;
    
    const events = this.currentPlayer.events_joined || 0;
    // Considérer 20 événements comme 100% de participation
    const maxEvents = 20;
    const percentage = Math.min((events / maxEvents) * 100, 100);
    
    return Math.round(percentage);
  }

  // ✅ Calculer la moyenne DKP par événement
  getDkpPerEvent(): number {
    if (!this.currentPlayer) return 0;
    
    const dkp = this.currentPlayer.dkp || 0;
    const events = this.currentPlayer.events_joined || 0;
    
    if (events === 0) return 0;
    
    return Math.round(dkp / events);
  }

  // ✅ Obtenir le rang de participation
  getParticipationRank(): string {
    if (!this.currentPlayer) return 'Aucun';
    
    const events = this.currentPlayer.events_joined || 0;
    
    if (events === 0) return 'Nouveau';
    if (events < 5) return 'Débutant';
    if (events < 15) return 'Actif';
    if (events < 30) return 'Vétéran';
    return 'Expert';
  }

  // ✅ Scroll vers la card personnage
  scrollToCharacterCard() {
    const characterCard = document.querySelector('.character-card');
    if (characterCard) {
      characterCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  // ✅ MODAL UPLOAD
  openUploadModal() {
    this.showUploadModal = true;
    this.resetUploadForm();
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.resetUploadForm();
  }

  resetUploadForm() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadForm = {
      title: '',
      description: '',
      isPublic: true
    };
  }

  // ✅ GESTION DRAG & DROP
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File) {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      this.notificationService.error(
        'Fichier invalide',
        'Veuillez sélectionner un fichier image'
      );
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.error(
        'Fichier trop volumineux',
        'La taille maximum autorisée est de 10MB'
      );
      return;
    }

    this.selectedFile = file;
    
    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.isUploading = true;

    this.galleryService.uploadImage(
      this.selectedFile,
      this.uploadForm.title || undefined,
      this.uploadForm.description || undefined,
      this.uploadForm.isPublic
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(
            'Image uploadée',
            '✅ Votre image a été ajoutée à votre galerie'
          );
          
          // Ajouter la nouvelle image au début de la liste
          this.userImages.unshift(response.image);
          
          this.closeUploadModal();
        }
        this.isUploading = false;
      },
      error: (error) => {
        console.error('❌ Erreur upload:', error);
        this.notificationService.error(
          'Erreur upload',
          error.error?.message || 'Erreur lors de l\'upload de l\'image'
        );
        this.isUploading = false;
      }
    });
  }

  // ✅ MODAL IMAGE
  openImageModal(image: UserImage) {
    this.selectedImage = image;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
  }

  // ✅ SUPPRESSION IMAGE
  deleteImage(image: UserImage) {
    const imageName = image.title || image.original_name;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${imageName}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    this.galleryService.deleteImage(image.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(
            'Image supprimée',
            '🗑️ L\'image a été supprimée de votre galerie'
          );
          
          // Retirer l'image de la liste
          this.userImages = this.userImages.filter(img => img.id !== image.id);
          
          // Fermer le modal si c'était l'image affichée
          if (this.selectedImage?.id === image.id) {
            this.closeImageModal();
          }
        }
      },
      error: (error) => {
        console.error('❌ Erreur suppression:', error);
        this.notificationService.error(
          'Erreur suppression',
          error.error?.message || 'Impossible de supprimer l\'image'
        );
      }
    });
  }
}

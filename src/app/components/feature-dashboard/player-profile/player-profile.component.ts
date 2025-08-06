import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.scss']
})
export class PlayerProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  player: any = null;
  isLoading = true;
  errorMessage = '';
  playerId: number = 0;

  // ✅ NOUVELLES propriétés pour la galerie
  galleryViewMode: 'grid' | 'masonry' = 'grid';
  showImageModal = false;
  selectedImage: any = null;

  // ✅ AJOUTER l'injection de PLATFORM_ID
  private platformId = inject(PLATFORM_ID);
  private keyDownListener?: (event: KeyboardEvent) => void;

  ngOnInit() {
    // ✅ Récupérer l'ID du joueur depuis l'URL
    this.route.params.subscribe(params => {
      this.playerId = +params['id']; // + convertit en number
      if (this.playerId) {
        this.loadPlayerProfile();
      } else {
        this.errorMessage = 'ID de joueur invalide';
        this.isLoading = false;
      }
    });

    // ✅ AJOUTER l'écoute des touches seulement côté client
    if (isPlatformBrowser(this.platformId)) {
      this.keyDownListener = this.onKeyDown.bind(this);
      document.addEventListener('keydown', this.keyDownListener);
    }
  }

  loadPlayerProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    const token = this.getCookie('auth_token');
    if (!token) {
      this.errorMessage = 'Token d\'authentification manquant';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${environment.apiUrl}/players/${this.playerId}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Profil joueur chargé:', response);
        this.player = response.player || response; // Adapter selon ta réponse API
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement profil:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du chargement du profil';
        this.isLoading = false;
      }
    });
  }

  // ✅ Méthodes utilitaires
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

  getClassColor(classKey: string): string {
    const classColors: { [key: string]: string } = {
      'tank': '#3b82f6',
      'dps': '#ef4444',
      'support': '#10b981',
      'range': '#f59e0b',
      'mage': '#8b5cf6'
    };
    return classColors[classKey] || '#6b7280';
  }

  goBack() {
    this.router.navigate(['/members']);
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // ✅ Ajouter dans player-profile.component.ts
  getPerformanceScore(): number {
    if (!this.player) return 0;
    
    // Calcul simple du score basé sur niveau, DKP et événements
    const levelScore = (this.player.level / 55) * 40; // 40 points max pour le niveau
    const dkpScore = Math.min((this.player.dkp || 0) / 10, 30); // 30 points max pour le DKP
    const eventsScore = Math.min((this.player.events_joined || 0) * 3, 30); // 30 points max pour les événements
    
    return Math.round(levelScore + dkpScore + eventsScore);
  }

  // ✅ NOUVELLES méthodes pour la galerie

  openImageModal(image: any) {
    this.selectedImage = image;
    this.showImageModal = true;
    
    // ✅ VÉRIFIER si on est dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
    
    // ✅ VÉRIFIER si on est dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  getCurrentImageIndex(): number {
    if (!this.selectedImage || !this.player.user?.images) return 0;
    return this.player.user.images.findIndex((img: any) => img.id === this.selectedImage.id);
  }

  navigateImage(direction: 'prev' | 'next') {
    if (!this.player.user?.images || !this.selectedImage) return;

    const currentIndex = this.getCurrentImageIndex();
    let newIndex = currentIndex;

    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < this.player.user.images.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      this.selectedImage = this.player.user.images[newIndex];
    }
  }

  // ✅ Gérer les touches clavier dans le modal
  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.showImageModal) return;

    switch (event.key) {
      case 'Escape':
        this.closeImageModal();
        break;
      case 'ArrowLeft':
        this.navigateImage('prev');
        break;
      case 'ArrowRight':
        this.navigateImage('next');
        break;
    }
  }

  ngOnDestroy() {
    // ✅ NETTOYER les event listeners seulement côté client
    if (isPlatformBrowser(this.platformId)) {
      if (this.keyDownListener) {
        document.removeEventListener('keydown', this.keyDownListener);
      }
      document.body.style.overflow = 'auto';
    }
  }
}

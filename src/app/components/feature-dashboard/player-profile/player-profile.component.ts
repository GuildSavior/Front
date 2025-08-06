import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.scss']
})
export class PlayerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  player: any = null;
  isLoading = true;
  errorMessage = '';
  playerId: number = 0;

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
}

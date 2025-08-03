// src/app/pages/join-guild/join-guild.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuildInvitationService } from '../../services/invitations/guild-invitation.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment'; // ✅ AJOUTER

@Component({
  selector: 'app-join-guild',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="join-guild-container">
      <div class="join-guild-card">
        
        <!-- Loading -->
        <div *ngIf="loading" class="loading-section">
          <div class="loading-spinner"></div>
          <h3>Traitement de l'invitation...</h3>
          <p>Veuillez patienter...</p>
          <!-- ✅ Afficher l'environnement en développement -->
          <small *ngIf="!environment.production" class="debug-info">
            🔧 Mode développement - API: {{ environment.apiUrl }}
          </small>
        </div>

        <!-- Error -->
        <div *ngIf="error" class="error-section">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Erreur</h3>
          <p>{{ error }}</p>
          <!-- ✅ Debug en développement -->
          <div *ngIf="!environment.production && debugError" class="debug-error">
            <details>
              <summary>🐛 Informations de debug</summary>
              <pre>{{ debugError | json }}</pre>
            </details>
          </div>
          <div class="error-actions">
            <button *ngIf="needsLogin" (click)="goToLogin()" class="login-btn">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Se connecter
            </button>
            <button (click)="goToHome()" class="home-btn">
              <i class="fas fa-home mr-2"></i>
              Retour à l'accueil
            </button>
          </div>
        </div>

        <!-- Success -->
        <div *ngIf="success" class="success-section">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Félicitations !</h3>
          <p>{{ success }}</p>
          <div *ngIf="joinedGuild" class="guild-info">
            <h4>{{ joinedGuild.name }}</h4>
            <p>{{ joinedGuild.description }}</p>
          </div>
          <button (click)="goToDashboard()" class="dashboard-btn">
            <i class="fas fa-tachometer-alt mr-2"></i>
            Aller au dashboard
          </button>
        </div>

      </div>
    </div>
  `,
  styleUrls: ['./join-guild.component.scss']
})
export class JoinGuildComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationService = inject(GuildInvitationService);
  private authService = inject(AuthService);
  
  // ✅ Exposer l'environnement au template
  environment = environment;
  
  loading = true;
  error = '';
  success = '';
  needsLogin = false;
  joinedGuild: any = null;
  debugError: any = null; // ✅ Pour les infos de debug

  ngOnInit() {
    // ✅ Log en développement uniquement
    if (environment.enableDebugLogs) {
      console.log('🔧 JoinGuildComponent - Mode développement activé');
      console.log('🔧 API URL:', environment.apiUrl);
    }

    this.route.params.subscribe(params => {
      const code = params['code'];
      if (code) {
        if (environment.enableDebugLogs) {
          console.log('🔧 Code d\'invitation reçu:', code);
        }
        this.joinGuild(code);
      } else {
        this.error = 'Code d\'invitation manquant';
        this.loading = false;
      }
    });
  }

  joinGuild(code: string) {
    // ✅ Debug en développement
    if (environment.enableDebugLogs) {
      console.log('🔧 Tentative de rejoindre la guilde avec le code:', code);
      console.log('🔧 Statut authentification:', this.authService.isLoggedIn());
    }

    if (!this.authService.isLoggedIn()) {
      this.error = 'Vous devez être connecté pour rejoindre une guilde.';
      this.needsLogin = true;
      this.loading = false;
      return;
    }

    this.invitationService.joinGuild(code).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        // ✅ Debug en développement
        if (environment.enableDebugLogs) {
          console.log('🔧 Réponse API joinGuild:', response);
        }

        if (response.success) {
          this.success = response.message;
          this.joinedGuild = response.guild;
          console.log('✅ Guilde rejointe:', response);
        } else {
          this.error = response.message || 'Erreur lors du traitement de l\'invitation';
        }
      },
      error: (error) => {
        this.loading = false;
        
        // ✅ Stocker l'erreur pour le debug
        if (environment.enableDebugLogs) {
          this.debugError = error;
          console.error('❌ Erreur complète join guild:', error);
        }
        
        if (error.status === 401) {
          this.error = 'Vous devez être connecté pour rejoindre une guilde.';
          this.needsLogin = true;
        } else {
          this.error = error.error?.message || 'Erreur lors du traitement de l\'invitation';
        }
      }
    });
  }

  goToLogin() {
    // ✅ URL différente selon l'environnement
    const currentUrl = window.location.pathname;
    sessionStorage.setItem('pendingGuildJoin', currentUrl);
    
    if (environment.enableDebugLogs) {
      console.log('🔧 Redirection vers login, URL sauvegardée:', currentUrl);
    }
    
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
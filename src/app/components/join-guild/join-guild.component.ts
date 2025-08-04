// src/app/pages/join-guild/join-guild.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
        </div>

        <!-- Error -->
        <div *ngIf="error" class="error-section">
          <div class="error-icon">❌</div>
          <h3>Erreur</h3>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button *ngIf="needsLogin" (click)="goToLogin()" class="login-btn">
              Se connecter
            </button>
            <button (click)="goToHome()" class="home-btn">
              Retour à l'accueil
            </button>
          </div>
        </div>

        <!-- Success -->
        <div *ngIf="success" class="success-section">
          <div class="success-icon">✅</div>
          <h3>Félicitations !</h3>
          <p>{{ success }}</p>
          <div *ngIf="joinedGuild" class="guild-info">
            <h4>{{ joinedGuild.name }}</h4>
            <p>{{ joinedGuild.description }}</p>
            <p>Membres: {{ joinedGuild.member_count }}</p>
          </div>
          <button (click)="goToDashboard()" class="dashboard-btn">
            Aller au dashboard
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .join-guild-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .join-guild-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-section, .success-section {
      padding: 1rem;
    }
    .error-icon, .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      margin: 0.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .login-btn { background: #3498db; color: white; }
    .home-btn { background: #95a5a6; color: white; }
    .dashboard-btn { background: #27ae60; color: white; }
    .guild-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
    }
  `]
})
export class JoinGuildComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  loading = true;
  error = '';
  success = '';
  needsLogin = false;
  joinedGuild: any = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.joinGuild(code);
      } else {
        this.error = 'Code d\'invitation manquant';
        this.loading = false;
      }
    });
  }

  joinGuild(code: string) {
    // Vérifier si on a un token d'auth
    const token = this.getCookie('auth_token') || localStorage.getItem('auth_token');
    
    if (!token) {
      this.error = 'Vous devez être connecté pour rejoindre une guilde.';
      this.needsLogin = true;
      this.loading = false;
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // ⭐ APPELER L'API POUR REJOINDRE LA GUILDE
    this.http.get(`${environment.apiUrl}/invite/${code}`, { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
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
          console.error('❌ Erreur join guild:', error);
          
          if (error.status === 401) {
            this.error = 'Vous devez être connecté pour rejoindre une guilde.';
            this.needsLogin = true;
          } else {
            this.error = error.error?.message || 'Erreur lors du traitement de l\'invitation';
          }
        }
      });
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  goToLogin() {
    this.router.navigate(['/home']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
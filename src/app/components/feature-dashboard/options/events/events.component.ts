import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { GuildService } from '../../../../services/guild/guild.service';
import { EventService } from '../../../../services/events/events.service';
import { User } from '../../../../models/user.model';
import { Guild } from '../../../../models/guild.model';
import { Event } from '../../../../services/events/events.service'; 
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  private authService = inject(AuthService);
  private guildService = inject(GuildService);
  private eventService = inject(EventService);
  private router = inject(Router);

  // ✅ État principal
  user: User | null = null;
  guild: Guild | null = null;
  events: Event[] = [];
  isLoading = true;
  isLoadingEvents = false;
  isCreatingEvent = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // ✅ Formulaire création événement - Corriger les noms
  eventForm = {
    name: '', // ✅ Corriger: "name" au lieu de "title"
    description: '',
    start_time: '',
    end_time: '',
    dkp_reward: 10
  };

  // ✅ Formulaire validation présence
  validationForm = {
    eventId: null as number | null,
    code: ''
  };

  // ✅ États UI
  showCreateForm = false;
  showValidationModal = false;
  selectedEvent: Event | null = null;

  // ✅ Propriété pour savoir si l'utilisateur est owner
  get isGuildOwner(): boolean {
    if (!this.user || !this.guild) {
      return false;
    }
    
    const userId = Number(this.user.id);
    const ownerId = Number(this.guild.owner_id);
    
    if (environment.enableDebugLogs) {
      console.log('🔧 isGuildOwner check:', { userId, ownerId });
    }
    
    return userId === ownerId;
  }

  ngOnInit() {
    if (environment.enableDebugLogs) {
      console.log('🔧 EventsComponent - Initialisation');
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
            console.log('🔧 Events - Utilisateur chargé:', this.user);
          }
          
          this.guildService.getCurrentGuild().subscribe({
            next: (response) => {
              if (response.success) {
                this.guild = response.guild;
                if (environment.enableDebugLogs) {
                  console.log('✅ Guilde chargée:', this.guild);
                }
                this.loadEvents();
              } else {
                this.errorMessage = 'Vous devez être membre d\'une guilde pour voir les événements.';
                if (environment.enableDebugLogs) {
                  console.log('ℹ️ Utilisateur sans guilde');
                }
              }
              this.isLoading = false;
            },
            error: (error) => {
              if (error.status === 404) {
                this.errorMessage = 'Vous devez être membre d\'une guilde pour voir les événements.';
                if (environment.enableDebugLogs) {
                  console.log('ℹ️ Utilisateur sans guilde (404)');
                }
              } else {
                console.error('❌ Erreur récupération guilde:', error);
                this.errorMessage = 'Erreur lors du chargement de la guilde.';
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

  // ✅ CHARGEMENT DES ÉVÉNEMENTS
  loadEvents() {
    if (!this.guild) {
      return;
    }

    this.isLoadingEvents = true;
    
    this.eventService.getEvents().subscribe({
      next: (response) => {
        if (environment.enableDebugLogs) {
          console.log('✅ Réponse événements:', response);
        }

        if (response.success) {
          this.events = response.events || [];
          if (environment.enableDebugLogs) {
            console.log('✅ Événements chargés:', this.events.length);
          }
        } else {
          this.events = [];
          console.warn('⚠️ Pas d\'événements trouvés');
        }
        
        this.isLoadingEvents = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement événements:', error);
        this.isLoadingEvents = false;
        this.events = [];
        
        if (error.status === 403) {
          this.errorMessage = 'Vous ne possédez aucune guilde.';
        } else {
          this.errorMessage = 'Erreur lors du chargement des événements.';
        }
        
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ✅ AFFICHAGE FORMULAIRE CRÉATION
  showCreateEventForm() {
    if (!this.isGuildOwner) {
      this.errorMessage = 'Seul le propriétaire de la guilde peut créer des événements.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.showCreateForm = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // ✅ Pré-remplir avec des dates par défaut
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0); // 20h00
    
    const endTime = new Date(tomorrow);
    endTime.setHours(23, 0, 0, 0); // 23h00
    
    this.eventForm.start_time = this.formatDateTimeLocal(tomorrow);
    this.eventForm.end_time = this.formatDateTimeLocal(endTime);
  }

  // ✅ ANNULER CRÉATION
  cancelCreateEvent() {
    this.showCreateForm = false;
    this.eventForm = {
      name: '', // ✅ Corriger
      description: '',
      start_time: '',
      end_time: '',
      dkp_reward: 10
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ CRÉER UN ÉVÉNEMENT - Corriger
  createEvent() {
    if (!this.eventForm.name.trim()) { // ✅ Corriger: name au lieu de title
      this.errorMessage = 'Le nom de l\'événement est obligatoire.';
      return;
    }

    if (!this.eventForm.start_time || !this.eventForm.end_time) {
      this.errorMessage = 'Les heures de début et de fin sont obligatoires.';
      return;
    }

    if (new Date(this.eventForm.start_time) >= new Date(this.eventForm.end_time)) {
      this.errorMessage = 'L\'heure de fin doit être après l\'heure de début.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const eventData = {
      name: this.eventForm.name.trim(), // ✅ Corriger
      description: this.eventForm.description.trim(),
      start_time: this.eventForm.start_time,
      end_time: this.eventForm.end_time,
      dkp_reward: this.eventForm.dkp_reward
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        if (response.success) {
          this.events.unshift(response.event);
          this.showCreateForm = false;
          this.isSubmitting = false;
          
          this.eventForm = {
            name: '', // ✅ Corriger
            description: '',
            start_time: '',
            end_time: '',
            dkp_reward: 10
          };
          
          this.successMessage = '🎉 Événement créé avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de la création';
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('❌ Erreur création événement:', error);
        this.isSubmitting = false;
        
        if (error.status === 403) {
          this.errorMessage = 'Vous ne possédez aucune guilde ou vous n\'êtes pas autorisé.';
        } else if (error.status === 422) {
          const validationErrors = error.error.errors || {};
          this.errorMessage = Object.values(validationErrors).flat().join(', ');
        } else {
          this.errorMessage = error.error.message || 'Erreur lors de la création de l\'événement.';
        }
        
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ✅ S'INSCRIRE À UN ÉVÉNEMENT - Corriger selon ton backend
  participateInEvent(event: Event) {
    if (event.user_participation?.status) {
      this.errorMessage = 'Vous participez déjà à cet événement.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.eventService.participateInEvent(event.id).subscribe({
      next: (response) => {
        if (response.success) {
          // ✅ Recharger les événements pour avoir les bonnes données
          this.loadEvents();
          this.successMessage = '✅ Inscription réussie !';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de l\'inscription';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('❌ Erreur inscription:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ✅ CONFIRMER SA VENUE - Corriger
  confirmParticipation(event: Event) {
    if (!event.user_participation?.status) {
      this.errorMessage = 'Vous devez d\'abord vous inscrire à l\'événement.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (event.user_participation.status === 'confirmed' || event.user_participation.status === 'attended') {
      this.errorMessage = 'Vous avez déjà confirmé votre venue.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.eventService.confirmParticipation(event.id).subscribe({
      next: (response) => {
        if (response.success) {
          // ✅ Recharger les événements
          this.loadEvents();
          this.successMessage = '✅ Venue confirmée !';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de la confirmation';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('❌ Erreur confirmation:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la confirmation';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ✅ OUVRIR MODAL VALIDATION - Corriger
  openValidationModal(event: Event) {
    if (!event.user_participation?.status) {
      this.errorMessage = 'Vous devez d\'abord vous inscrire à l\'événement.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (event.user_participation.status === 'attended') {
      this.errorMessage = 'Vous avez déjà validé votre présence pour cet événement.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.selectedEvent = event;
    this.validationForm.eventId = event.id;
    this.validationForm.code = '';
    this.showValidationModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ VALIDER PRÉSENCE AVEC CODE - Corriger
  validateAttendance() {
    if (!this.validationForm.code.trim()) {
      this.errorMessage = 'Veuillez entrer le code de validation.';
      return;
    }

    if (!this.validationForm.eventId) {
      this.errorMessage = 'Erreur: événement non sélectionné.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.eventService.validateAttendance(this.validationForm.eventId, this.validationForm.code).subscribe({
      next: (response) => {
        if (response.success) {
          // ✅ Recharger les événements
          this.loadEvents();
          this.successMessage = `🎉 Présence validée ! Vous avez reçu ${response.dkp_earned} DKP !`;
          this.closeValidationModal();
          
          setTimeout(() => this.successMessage = '', 5000);
        } else {
          this.errorMessage = response.message || 'Code de validation incorrect.';
        }
        
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Erreur validation:', error);
        this.isSubmitting = false;
        
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Code de validation incorrect.';
        } else if (error.status === 403) {
          this.errorMessage = 'Vous n\'êtes pas autorisé à valider cette présence.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de la validation.';
        }
      }
    });
  }

  // ✅ FERMER MODAL VALIDATION
  closeValidationModal() {
    this.showValidationModal = false;
    this.selectedEvent = null;
    this.validationForm = {
      eventId: null,
      code: ''
    };
    this.errorMessage = '';
  }

  // ✅ UTILITAIRES - Corriger selon ton backend
  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  isEventUpcoming(event: Event): boolean {
    return new Date(event.start_time) > new Date();
  }

  isEventOngoing(event: Event): boolean {
    const now = new Date();
    return new Date(event.start_time) <= now && new Date(event.end_time) > now;
  }

  isEventPast(event: Event): boolean {
    return new Date(event.end_time) < new Date();
  }

  getEventStatus(event: Event): string {
    if (this.isEventUpcoming(event)) return 'upcoming';
    if (this.isEventOngoing(event)) return 'ongoing';
    return 'past';
  }

  // ✅ COMPLÉTER les méthodes manquantes à la fin du fichier

  // ✅ UTILITAIRES
  getEventStatusText(event: Event): string {
    switch (event.status) {
      case 'upcoming': return 'À venir';
      case 'ongoing': return 'En cours';
      case 'finished': return 'Terminé';
      default: return 'Inconnu';
    }
  }

  getEventStatusIcon(event: Event): string {
    switch (event.status) {
      case 'upcoming': return 'fa-clock';
      case 'ongoing': return 'fa-play';
      case 'finished': return 'fa-check';
      default: return 'fa-question';
    }
  }

  // ✅ Copier code (pour l'owner)
  copyAccessCode(event: Event) {
    if (!this.isGuildOwner || !event.access_code) {
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(event.access_code).then(() => {
        this.successMessage = '📋 Code d\'accès copié !';
        setTimeout(() => this.successMessage = '', 2000);
      });
    }
  }

  // ✅ Obtenir le statut de participation utilisateur
  getUserParticipationStatus(event: Event): string {
    if (!event.user_participation) {
      return 'not_participating';
    }
    return event.user_participation.status;
  }

  getUserParticipationText(event: Event): string {
    const status = this.getUserParticipationStatus(event);
    switch (status) {
      case 'not_participating': return 'Non inscrit';
      case 'interested': return 'Intéressé';
      case 'confirmed': return 'Confirmé';
      case 'attended': return 'Présent';
      default: return 'Inconnu';
    }
  }

  getUserParticipationIcon(event: Event): string {
    const status = this.getUserParticipationStatus(event);
    switch (status) {
      case 'not_participating': return 'fa-user-plus';
      case 'interested': return 'fa-star';
      case 'confirmed': return 'fa-check';
      case 'attended': return 'fa-medal';
      default: return 'fa-question';
    }
  }

  // ✅ Navigation
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

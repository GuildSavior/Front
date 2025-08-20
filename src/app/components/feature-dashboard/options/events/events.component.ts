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
import { NotificationService } from '../../../../services/notification/notification.service';

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
  private notificationService = inject(NotificationService);

  // ✅ Propriété pour savoir si l'utilisateur est owner
  get isGuildOwner(): boolean {
    if (!this.user || !this.guild) {
      return false;
    }
    
    const userId = Number(this.user.id);
    const ownerId = Number(this.guild.owner_id);
    
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
    // ✅ NOUVEAU: Ne pas charger les événements si pas de guilde
    if (!this.guild) {
      if (environment.enableDebugLogs) {
        console.log('ℹ️ Pas de guilde, pas de chargement d\'événements');
      }
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
          // ✅ NOUVEAU: Message plus doux
          console.log('ℹ️ Pas d\'accès aux événements (pas de guilde)');
        } else {
          this.errorMessage = 'Erreur lors du chargement des événements.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
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
    console.log('🔧 Création événement:', eventData);

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
          
           this.notificationService.success(
              'Événement créé avec succès !', 
              'Votre événement a été ajouté à la liste.'
            );
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
          this.notificationService.success(
            'Inscription réussie !', 
            `Vous êtes maintenant inscrit à l'événement "${event.name}".`
          );
        } else {
          this.notificationService.error(
            'Erreur lors de l\'inscription',
            'Une erreur est survenue.'
          );
          this.notificationService.error(
            'Erreur lors de l\'inscription',
            this.errorMessage
          );
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: (error) => {
        this.notificationService.error(
          'Erreur lors de l\'inscription',
          error.error?.message || 'Erreur lors de l\'inscription'
        );
      }
    });
  }

  // ✅ CONFIRMER SA VENUE - Corriger
  confirmParticipation(event: Event) {
    if (!event.user_participation?.status) {
      this.notificationService.warning(
        'Inscription requise',
        'Vous devez d\'abord vous inscrire à l\'événement.'
      );
      return;
    }

    if (event.user_participation.status === 'confirmed' || event.user_participation.status === 'attended') {
      this.notificationService.warning(
        'Confirmation requise',
        'Vous avez déjà confirmé votre venue.'
      );
      return;
    }

    this.eventService.confirmParticipation(event.id).subscribe({
      next: (response) => {
        if (response.success) {
          // ✅ Recharger les événements
          this.loadEvents();
          this.notificationService.success(
            '✅ Venue confirmée !',
            'Votre participation à l\'événement a été confirmée.'
          );
        } else {
          this.notificationService.error(
            'Erreur lors de la confirmation',
            response.message || 'Erreur lors de la confirmation'
          );
        }
      },
      error: (error) => {
        this.notificationService.error(
          'Erreur lors de la confirmation',
          error.error?.message || 'Erreur lors de la confirmation'
        );
      }
    });
  }

  // ✅ VALIDER PRÉSENCE AVEC CODE - Corriger
  validateAttendance() {
    if (!this.validationForm.code.trim()) {
      this.notificationService.error(
        'Erreur de validation',
        'Veuillez entrer le code de validation.'
      );
      return;
    }

    if (!this.validationForm.eventId) {
      this.notificationService.error(
        'Erreur de validation',
        'Erreur: événement non sélectionné.'
      );
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.eventService.validateAttendance(this.validationForm.eventId, this.validationForm.code).subscribe({
      next: (response) => {
        if (response.success) {
          // ✅ Recharger les événements
          this.loadEvents();
          this.notificationService.success(
            '🎉 Présence validée !',
            `Vous avez reçu ${response.dkp_earned} DKP !`
          );
        } else {
          this.notificationService.error(
            'Erreur de validation',
            response.message || 'Code de validation incorrect.'
          );
        }
        
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 400) {
          this.notificationService.error(
            'Erreur de validation',
            error.error?.message || 'Code de validation incorrect.'
          );
        } else if (error.status === 403) {
          this.notificationService.error(
            'Erreur de validation',
            'Vous n\'êtes pas autorisé à valider cette présence.'
          );
        } else {
          this.notificationService.error(
            'Erreur de validation',
            error.error?.message || 'Erreur lors de la validation.'
          );
        }
      }
    });
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
        // ✅ Feedback visuel amélioré
        this.notificationService.success(
          'Code copié',
          `📋 Code "${event.access_code}" copié dans le presse-papier !`
        );

        // ✅ Ajouter effet visuel sur le bouton (optionnel)
        const copyBtn = document.querySelector(`[data-event-id="${event.id}"] .copy-code-btn`);
        if (copyBtn) {
          copyBtn.classList.add('copied');
          setTimeout(() => copyBtn.classList.remove('copied'), 600);
        }
        
        setTimeout(() => this.successMessage = '', 3000);
        
        if (environment.enableDebugLogs) {
          console.log('✅ Code d\'accès copié:', event.access_code);
        }
      }).catch((err) => {
        this.notificationService.error(
          'Erreur de copie',
          'Impossible de copier le code. Copiez-le manuellement.'
        );
      });
    } else {
      this.notificationService.error(
        'Erreur de copie',
        'Copie automatique non supportée. Copiez le code manuellement.'
      );
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

  // ✅ NOUVEAU: Gestion des codes de validation par événement
  eventValidationCodes: { [eventId: number]: string } = {};
  validatingEvents: Set<number> = new Set();

  // ✅ NOUVEAU: Méthodes pour gérer la validation directe
  getEventValidationCode(eventId: number): string {
    return this.eventValidationCodes[eventId] || '';
  }

  setEventValidationCode(eventId: number, code: string): void {
    this.eventValidationCodes[eventId] = code;
  }

  isValidatingEvent(eventId: number): boolean {
    return this.validatingEvents.has(eventId);
  }

  // ✅ NOUVELLE: Méthode de validation simplifiée
  validateEventAttendance(event: Event) {
    const code = this.eventValidationCodes[event.id];
    
    if (!code || !code.trim()) {
      this.notificationService.error(
        'Erreur de validation',
        'Veuillez entrer le code de validation donné par l\'organisateur.'
      );
      return;
    }

    // ✅ CORRECTION: Vérifier si la validation est encore possible (avec debug)
    const canValidate = this.canValidateAttendance(event);
    const now = new Date();
    const endTime = new Date(event.end_time);
    const gracePeriod = new Date(endTime.getTime() + (30 * 60 * 1000));
    
    console.log('🔍 Debug validation:', {
      eventName: event.name,
      now: now.toLocaleString(),
      endTime: endTime.toLocaleString(),
      gracePeriod: gracePeriod.toLocaleString(),
      canValidate: canValidate,
      userStatus: this.getUserParticipationStatus(event)
    });

    if (!canValidate) {
      if (now > gracePeriod) {
        this.notificationService.error(
          'Erreur de validation',
          'Cet événement est terminé. La validation n\'est plus possible (délai de 30 min dépassé).'
        );
      } else if (now < new Date(event.start_time)) {
        this.notificationService.error(
          'Erreur de validation',
          'La validation n\'est pas encore disponible pour cet événement.'
        );
      } else {
        this.notificationService.error(
          'Erreur de validation',
          'Vous devez confirmer votre venue pour pouvoir valider votre présence.'
        );
      }
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    // Vérifications préalables
    if (this.getUserParticipationStatus(event) === 'attended') {
      this.notificationService.error(
        'Erreur de validation',
        'Vous avez déjà validé votre présence pour cet événement.'
      );
      return;
    }

    if (this.getUserParticipationStatus(event) === 'not_participating') {
      this.notificationService.error(
        'Erreur de validation',
        'Vous devez d\'abord vous inscrire à cet événement.'
      );
      return;
    }

    if (this.getUserParticipationStatus(event) === 'interested') {
      this.notificationService.error(
        'Erreur de validation',
        'Vous devez d\'abord confirmer votre venue avant de pouvoir valider votre présence.'
      );
      return;
    }

    // Démarrer la validation
    this.validatingEvents.add(event.id);
    this.errorMessage = '';

    this.eventService.validateAttendance(event.id, code.trim().toUpperCase()).subscribe({
      next: (response) => {
        this.validatingEvents.delete(event.id);
        
        if (response.success) {
          // ✅ Recharger les événements pour mettre à jour l'état
          this.loadEvents();
          
          // ✅ Vider le code de validation
          this.eventValidationCodes[event.id] = '';
          
          // ✅ Message de succès avec DKP
          this.notificationService.success(
            'Validation réussie',
            `🎉 Félicitations ! Participation validée avec succès !
            \n💰 Vous avez reçu ${response.dkp_earned} DKP
            \n🏆 Total DKP: ${response.total_dkp}`
          );

          setTimeout(() => this.successMessage = '', 6000);
          
        } else {
          this.notificationService.error(
            'Erreur de validation',
            response.message || 'Code de validation incorrect.'
          );
        }
      },
      error: (error) => {
        this.validatingEvents.delete(event.id);
        console.error('❌ Erreur validation:', error);
        
        // Messages d'erreur plus précis
        if (error.status === 400) {
          const errorMsg = error.error?.message || 'Code de validation incorrect.';
          this.notificationService.error(
            'Erreur de validation',
            errorMsg
          );
        } else if (error.status === 403) {
          this.notificationService.error(
            'Erreur de validation',
            'Vous n\'êtes pas autorisé à valider cette présence.'
          );
        } else if (error.status === 404) {
          this.notificationService.error(
            'Erreur de validation',
            'Événement introuvable.'
          );
        } else if (error.status === 410) {
          this.notificationService.error(
            'Erreur de validation',
            'Cet événement est terminé. La validation n\'est plus possible.'
          );
        } else {
          this.notificationService.error(
            'Erreur de validation',
            'L\'événement est peut-être terminé ou le code est incorrect.'
          );
        }
        
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
  // ✅ SUPPRIMER UN ÉVÉNEMENT (Owner seulement)
  deleteEvent(event: Event) {
    if (!this.isGuildOwner) {
      this.notificationService.warning(
        'Action interdite',
        'Seul le propriétaire de la guilde peut supprimer des événements.'
      );
      return;
    }

    // Confirmation avec plus d'infos
    const participants = event.participant_count || 0;
    const confirmMessage = participants > 0 
      ? `⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de supprimer l'événement "${event.name}".\n\n👥 ${participants} participant(s) inscrit(s)\n\nCette action est irréversible et supprimera toutes les participations.\n\nContinuer ?`
      : `Supprimer l'événement "${event.name}" ?\n\nCette action est irréversible.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // ✅ Animation de suppression
    const eventCard = document.querySelector(`[data-event-id="${event.id}"]`);
    if (eventCard) {
      eventCard.classList.add('deleting');
    }

    this.deletingEvents.add(event.id);
    this.errorMessage = '';

    this.eventService.deleteEvent(event.id).subscribe({
      next: (response) => {
        this.deletingEvents.delete(event.id);
        
        if (response.success) {
          // ✅ Attendre la fin de l'animation avant de retirer de la liste
          setTimeout(() => {
            this.events = this.events.filter(e => e.id !== event.id);
          }, 500);
           this.notificationService.success(
              `Événement supprimé !`, 
              `L'événement "${event.name}" a été supprimé avec succès.`
            );
          
          console.log('✅ Événement supprimé:', event.name);
        } else {
          // ✅ Retirer l'animation en cas d'erreur
          if (eventCard) {
            eventCard.classList.remove('deleting');
          }
          
          this.errorMessage = response.message || 'Erreur lors de la suppression.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: (error) => {
        this.deletingEvents.delete(event.id);
        
        // ✅ Retirer l'animation en cas d'erreur
        if (eventCard) {
          eventCard.classList.remove('deleting');
        }
        
        console.error('❌ Erreur suppression événement:', error);
        
        if (error.status === 403) {
          this.notificationService.error(
            'Erreur de suppression',
            'Vous n\'êtes pas autorisé à supprimer cet événement.'
          );
        } else if (error.status === 404) {
          this.notificationService.error(
            'Erreur de suppression',
            'Événement introuvable.'
          );
        } else {
          this.notificationService.error(
            'Erreur de suppression',
            error.error?.message || 'Erreur lors de la suppression de l\'événement.'
          );
        }
        
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
  // ✅ AJOUTER cette propriété au début de la classe avec les autres
  deletingEvents: Set<number> = new Set();

  // ✅ Vérifier si l'événement est réellement terminé (pas juste le statut)
  isEventReallyFinished(event: Event): boolean {
    const now = new Date();
    const endTime = new Date(event.end_time);
    // ✅ CORRECTION: Terminé seulement après la grace period
    const gracePeriod = new Date(endTime.getTime() + (30 * 60 * 1000));
    return now > gracePeriod;
  }

  // ✅ Vérifier si la validation est encore possible
  canValidateAttendance(event: Event): boolean {
    // L'utilisateur doit être confirmé
    if (this.getUserParticipationStatus(event) !== 'confirmed') {
      return false;
    }
    
    // Vérification temporelle basée sur les vraies dates, pas le statut
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    // Grace period de 30 minutes après la fin
    const gracePeriod = new Date(endTime.getTime() + (30 * 60 * 1000));
    
    // ✅ CORRECTION: Validation possible si:
    // - L'événement a commencé ET
    // - Nous sommes encore dans la période de grâce
    return now >= startTime && now <= gracePeriod;
  }

  // ✅ Obtenir le message d'info pour la validation
  getValidationMessage(event: Event): string {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    const gracePeriod = new Date(endTime.getTime() + (30 * 60 * 1000));
    
    if (now > gracePeriod) {
      return 'Événement terminé - La validation n\'est plus possible';
    }
    
    if (now < startTime) {
      return 'L\'événement n\'a pas encore commencé';
    }
    
    // Si l'événement est fini mais on est dans la grace period
    if (now > endTime && now <= gracePeriod) {
      const timeLeft = gracePeriod.getTime() - now.getTime();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));
      return `Validation encore possible pendant ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} !`;
    }
    
    return `Saisissez le code donné par l'organisateur pour recevoir ${event.dkp_reward} DKP`;
  }

  // ✅ Obtenir le temps restant pour la validation
  getValidationTimeRemaining(event: Event): string {
    if (this.isEventReallyFinished(event)) {
      return 'Validation expirée';
    }

    const now = new Date();
    const endTime = new Date(event.end_time);
    const gracePeriod = new Date(endTime.getTime() + (30 * 60 * 1000)); // 30 min grace period
    
    if (now > gracePeriod) {
      return 'Validation expirée';
    }

    const timeLeft = gracePeriod.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    
    if (minutesLeft <= 0) {
      return 'Validation expire dans quelques secondes';
    }
    
    if (minutesLeft < 60) {
      return `Validation expire dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
    }
    
    const hoursLeft = Math.floor(minutesLeft / 60);
    const remainingMinutes = minutesLeft % 60;
    
    return `Validation expire dans ${hoursLeft}h${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
  }
  goToGuild() {
    this.router.navigate(['/guild']);
  }
}

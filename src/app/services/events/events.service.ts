import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Event {
  id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  dkp_reward: number;
  access_code?: string;
  guild_id: number;
  created_by: number;
  created_at: string;
  
  // ✅ Propriétés exactes du backend
  status: 'upcoming' | 'ongoing' | 'finished';
  created_by_name?: string;
  participant_count: number;
  confirmed_count: number;
  attended_count: number;
  
  // ✅ État utilisateur selon ton backend
  user_participation?: {
    status: 'interested' | 'confirmed' | 'attended';
    dkp_earned: number;
    attended_at?: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private debugLog(message: string, data?: any) {
    if (environment.enableDebugLogs) {
      console.log(`🎯 EventService - ${message}`, data);
    }
  }

  // ✅ CORRIGER: Utiliser getCookie comme tes autres services
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // ✅ CORRIGER: Utiliser getCookie au lieu de localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('auth_token'); // ✅ Changer ici
    
    if (environment.enableDebugLogs) {
      console.log('🔧 EventService token:', token ? '***' : 'null');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // ✅ Lister les événements de la guilde
  getEvents(): Observable<any> {
    const url = `${this.apiUrl}/guilds/events`;
    this.debugLog('Récupération des événements', url);
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Événements récupérés', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération événements', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Créer un événement (owner seulement)
  createEvent(eventData: any): Observable<any> {
    const url = `${this.apiUrl}/guilds/events`;
    this.debugLog('Création événement', { url, data: eventData });
    
    return this.http.post(url, eventData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Événement créé', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur création événement', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ S'inscrire à un événement
  participateInEvent(eventId: number): Observable<any> {
    const url = `${this.apiUrl}/guilds/events/${eventId}/participate`;
    this.debugLog('Inscription événement', { eventId, url });
    
    return this.http.post(url, {}, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Inscription événement réussie', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur inscription événement', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Confirmer sa venue à un événement
  confirmParticipation(eventId: number): Observable<any> {
    const url = `${this.apiUrl}/guilds/events/${eventId}/confirm`;
    this.debugLog('Confirmation participation', { eventId, url });
    
    return this.http.post(url, {}, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Confirmation participation réussie', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur confirmation participation', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Valider sa présence avec le code
  validateAttendance(eventId: number, accessCode: string): Observable<any> {
    const url = `${this.apiUrl}/guilds/events/${eventId}/validate`;
    this.debugLog('Validation présence', { eventId, url, code: '***' });
    
    return this.http.post(url, { 
      access_code: accessCode
    }, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Validation présence réussie', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur validation présence', error);
        return throwError(() => error);
      })
    );
  }
}

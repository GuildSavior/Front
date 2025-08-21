import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Auction {
  id: number;
  item_name: string;
  description?: string;
  starting_price: number;
  buyout_price?: number;
  current_bid: number;
  minimum_bid: number;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  is_active: boolean;
  can_bid: boolean;
  can_buyout: boolean;
  time_remaining?: string;
  creator: string;
  is_owner: boolean;
  current_winner?: string;
  is_current_winner?: boolean;
  winner?: string;
  final_price?: number;
  user_highest_bid?: number;
  total_bids: number;
  created_at: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  created_at: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export interface CreateAuctionRequest {
  item_name: string;
  description?: string;
  starting_price: number;
  buyout_price?: number;
  start_time: string;
  end_time: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private apiUrl = `${environment.apiUrl}/guilds/auctions`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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

  private debugLog(message: string, data?: any): void {
    if (environment.enableDebugLogs) {
      console.log(`🏺 AuctionService - ${message}`, data || '');
    }
  }

  // ✅ Récupérer toutes les enchères de la guilde
  getAuctions(): Observable<any> {
    this.debugLog('Récupération des enchères', this.apiUrl);
    
    return this.http.get(this.apiUrl, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Enchères récupérées', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération enchères', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Récupérer une enchère spécifique
  getAuction(auctionId: number): Observable<any> {
    const url = `${this.apiUrl}/${auctionId}`;
    this.debugLog('Récupération enchère', { id: auctionId, url });
    
    return this.http.get(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Enchère récupérée', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur récupération enchère', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Créer une nouvelle enchère
  createAuction(auctionData: CreateAuctionRequest): Observable<any> {
    this.debugLog('Création enchère', { url: this.apiUrl, data: auctionData });
    
    return this.http.post(this.apiUrl, auctionData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Enchère créée', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur création enchère', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Enchérir sur une enchère
  placeBid(auctionId: number, amount: number): Observable<any> {
    const url = `${this.apiUrl}/${auctionId}/bid`;
    const bidData = { bid_amount: amount };
    this.debugLog('Enchère', { id: auctionId, amount, url });
    
    return this.http.post(url, bidData, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Enchère placée', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur placement enchère', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Achat instantané
  buyout(auctionId: number): Observable<any> {
    const url = `${this.apiUrl}/${auctionId}/buyout`;
    this.debugLog('Achat instantané', { id: auctionId, url });
    
    return this.http.post(url, {}, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Achat instantané effectué', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur achat instantané', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Supprimer/Annuler une enchère (owner seulement)
  deleteAuction(auctionId: number): Observable<any> {
    const url = `${this.apiUrl}/${auctionId}`;
    this.debugLog('Annulation enchère', { id: auctionId, url });
    
    return this.http.delete(url, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.debugLog('✅ Enchère supprimée', response);
      }),
      catchError((error) => {
        this.debugLog('❌ Erreur suppression enchère', error);
        return throwError(() => error);
      })
    );
  }
}

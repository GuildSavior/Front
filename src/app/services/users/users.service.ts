import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  user: any = null;
  http = inject(HttpClient);
  constructor() { }
  private backendUrl = 'http://127.0.0.1:8000/api';

  getUserInformation(token: string | null): Observable<any> {
    if (!token) {
      console.error('Aucun token trouvé');
      return new Observable();  // Si le token est manquant, retourne un Observable vide
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.get<any>(`${this.backendUrl}/user`, { headers });
  }
}


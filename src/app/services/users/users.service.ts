import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  user: any = null;
  http = inject(HttpClient);
  constructor() { }
  private backendUrl = 'http://127.0.0.1:8000';
  
  getUserInformation(token: string):void{

    if (!token) {
      console.error('Aucun token trouvé');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    this.http.get(this.backendUrl + '/api/user', { headers }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          console.log("Utilisateur récupéré :", response.user);
          this.user = response.user;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des informations utilisateur :', err);
      }
  })
}
}

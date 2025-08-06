import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserImage {
  id: number;
  title: string;
  description: string;
  url: string;
  original_name: string;
  file_size: string;
  width: number;
  height: number;
  is_public: boolean;
  created_at: string;
}

export interface GalleryResponse {
  success: boolean;
  images: UserImage[];
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  image: UserImage;
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = this.getCookie('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
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

  // ✅ Récupérer mes images
  getMyImages(): Observable<GalleryResponse> {
    const headers = this.getHeaders();
    return this.http.get<GalleryResponse>(`${environment.apiUrl}/gallery`, { headers });
  }

  // ✅ Upload une image
  uploadImage(file: File, title?: string, description?: string, isPublic: boolean = true): Observable<UploadResponse> {
    const headers = this.getHeaders();
    
    const formData = new FormData();
    formData.append('image', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('is_public', isPublic ? '1' : '0');

    return this.http.post<UploadResponse>(`${environment.apiUrl}/gallery`, formData, { headers });
  }

  // ✅ Supprimer une image
  deleteImage(imageId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${environment.apiUrl}/gallery/${imageId}`, { headers });
  }

  // ✅ Récupérer la galerie publique d'un utilisateur
  getUserGallery(userId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/${userId}/gallery`);
  }
}

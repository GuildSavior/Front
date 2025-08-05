import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  
  getNotifications() {
    return this.notifications$.asObservable();
  }

  show(notification: Omit<Notification, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, newNotification]);

    // Auto-remove après duration
    setTimeout(() => {
      this.remove(id);
    }, newNotification.duration);
  }

  remove(id: string) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  success(title: string, message: string) {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message: string) {
    this.show({ type: 'error', title, message });
  }

  warning(title: string, message: string) {
    this.show({ type: 'warning', title, message });
  }

  info(title: string, message: string) {
    this.show({ type: 'info', title, message });
  }
}

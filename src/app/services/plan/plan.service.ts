import { Injectable } from '@angular/core';
import { User, Subscription } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor() { }

  // ✅ Vérification sécurisée du statut Premium
  isPremiumActive(user: User): boolean {
    if (!user?.subscription) {
      return false;
    }

    const subscription = user.subscription;
    
    // Vérifications multiples pour la sécurité
    const isActive = subscription.status === 'active';
    const hasValidPlan = subscription.plan_type === 'premium';
    const isNotExpired = new Date(subscription.expires_at) > new Date();
    
    return isActive && hasValidPlan && isNotExpired;
  }

  // ✅ Informations détaillées de l'abonnement
  getSubscriptionDetails(user: User) {
    if (!this.isPremiumActive(user)) {
      return null;
    }
    
    const subscription = user.subscription!;
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      expiresAt,
      daysLeft,
      planType: subscription.plan_type,
      status: subscription.status,
      isExpiringSoon: daysLeft <= 7, // Alerte si expire dans 7 jours
      formattedExpiry: expiresAt.toLocaleDateString('fr-FR'),
      price: subscription.price
    };
  }

  // ✅ Vérification si l'utilisateur peut upgrader
  canUpgrade(user: User): boolean {
    return !this.isPremiumActive(user);
  }

  // ✅ Obtenir le statut d'affichage
  getPremiumStatus(user: User): 'premium' | 'expired' | 'none' {
    if (!user?.subscription) {
      return 'none';
    }

    const subscription = user.subscription;
    const isActive = subscription.status === 'active';
    const isNotExpired = new Date(subscription.expires_at) > new Date();
    
    if (isActive && isNotExpired) {
      return 'premium';
    } else if (subscription.plan_type === 'premium' && !isNotExpired) {
      return 'expired';
    }
    
    return 'none';
  }

  // ✅ Badge de couleur selon le statut
  getPremiumBadgeClass(user: User): string {
    const status = this.getPremiumStatus(user);
    
    switch (status) {
      case 'premium':
        return 'premium-active';
      case 'expired':
        return 'premium-expired';
      default:
        return 'premium-none';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { AuctionService, Auction } from '../../../../services/auction/auction.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification/notification.service';
import { User } from '../../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GuildService } from '../../../../services/guild/guild.service';

@Component({
  selector: 'app-auction',
  standalone: true,
  templateUrl: './auction.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./auction.component.scss']
})
export class AuctionComponent implements OnInit {
  user: User | null = null;
  guild: any = null; // Ajoute cette propriété pour stocker la guilde
  auctions: Auction[] = [];
  isLoading = true;
  isCreatingAuction = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  userDkp = 0;
  tab: 'all' | 'active' | 'upcoming' = 'all';

  auctionForm = {
    item_name: '',
    description: '',
    starting_price: 1,
    buyout_price: undefined,
    start_time: '',
    end_time: ''
  };

  bidAmounts: { [auctionId: number]: number } = {};

  constructor(
    private auctionService: AuctionService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private guildService: GuildService // Assure-toi d'importer et d'injecter ton service de guilde
  ) {}

  ngOnInit() {
    this.loadUserAndGuild();
  }

  loadUserAndGuild() {
    this.isLoading = true;
    this.authService.checkAuthStatus().subscribe({
      next: (response) => {
        this.user = response.user;
        // Charge la guilde comme dans EventsComponent
        this.guildService.getCurrentGuild().subscribe({
          next: (guildResponse) => {
            if (guildResponse.success) {
              this.guild = guildResponse.guild;
              this.loadAuctions();
            } else {
              this.guild = null;
              this.isLoading = false;
            }
          },
          error: () => {
            this.guild = null;
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadAuctions() {
    this.auctionService.getAuctions().subscribe({
      next: (response) => {
        if (response.success) {
          // ✅ Filtrer pour ne garder que les enchères actives
          this.auctions = (response.auctions);
          this.userDkp = response.user_dkp || 0;
          this.initBidAmounts();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get isGuildOwner(): boolean {
    if (!this.user || !this.guild) {
      return false;
    }
    const userId = Number(this.user.id);
    const ownerId = Number(this.guild.owner_id);
    return userId === ownerId;
  }

  showCreateForm() {
    if (!this.isGuildOwner) {
      this.notificationService.error('Accès refusé', 'Seul le propriétaire de la guilde peut créer des enchères.');
      return;
    }
    this.isCreatingAuction = true;
    this.errorMessage = '';
    this.successMessage = '';
    const now = new Date();
    this.auctionForm.start_time = this.formatDateForInput(new Date(now.getTime() + 5 * 60000));
    this.auctionForm.end_time = this.formatDateForInput(new Date(now.getTime() + 24 * 60 * 60000));
  }

  cancelCreate() {
    this.isCreatingAuction = false;
    this.auctionForm = {
      item_name: '',
      description: '',
      starting_price: 1,
      buyout_price: undefined,
      start_time: '',
      end_time: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  createAuction() {
    if (!this.auctionForm.item_name.trim()) {
      this.errorMessage = 'Le nom de l\'objet est obligatoire.';
      return;
    }
    if (this.auctionForm.starting_price < 1) {
      this.errorMessage = 'Le prix de départ doit être d\'au moins 1 DKP.';
      return;
    }
    if (this.auctionForm.buyout_price && this.auctionForm.buyout_price <= this.auctionForm.starting_price) {
      this.errorMessage = 'Le prix d\'achat instantané doit être supérieur au prix de départ.';
      return;
    }
    if (!this.auctionForm.start_time || !this.auctionForm.end_time) {
      this.errorMessage = 'Les dates de début et de fin sont obligatoires.';
      return;
    }
    if (new Date(this.auctionForm.start_time) >= new Date(this.auctionForm.end_time)) {
      this.errorMessage = 'La date de fin doit être après la date de début.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    const auctionData = {
  item_name: this.auctionForm.item_name.trim(),
  description: this.auctionForm.description?.trim() || '',
  starting_price: this.auctionForm.starting_price,
  buyout_price: this.auctionForm.buyout_price,
  start_time: this.formatDateForBackend(this.auctionForm.start_time),
  end_time: this.formatDateForBackend(this.auctionForm.end_time)
};
this.auctionService.createAuction(auctionData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Enchère créée !', `L'enchère pour "${auctionData.item_name}" a été créée.`);
          this.cancelCreate();
          this.loadAuctions();
        } else {
          this.errorMessage = response.message || 'Erreur lors de la création de l\'enchère';
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'enchère';
        this.isSubmitting = false;
      }
    });
  }

  initBidAmounts() {
    this.auctions.forEach(a => {
      this.bidAmounts[a.id] = a.minimum_bid;
    });
  }

  placeBid(auction: Auction) {
    const bidAmount = this.bidAmounts[auction.id];
    if (!bidAmount || bidAmount < auction.minimum_bid) {
      this.notificationService.error('Enchère invalide', `Votre enchère doit être d'au moins ${auction.minimum_bid} DKP.`);
      return;
    }
    if (bidAmount > this.userDkp) {
      this.notificationService.error('DKP insuffisants', `Vous n'avez que ${this.userDkp} DKP disponibles.`);
      return;
    }
    this.auctionService.placeBid(auction.id, bidAmount).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Enchère placée !', `Votre enchère de ${bidAmount} DKP a été enregistrée.`);
          this.loadAuctions();
        } else {
          this.notificationService.error('Erreur', response.message || 'Erreur lors de l\'enchère');
        }
      },
      error: (error) => {
        this.notificationService.error('Erreur', error.error?.message || 'Erreur lors de l\'enchère');
      }
    });
  }

  buyoutAuction(auction: Auction) {
    if (!auction.buyout_price) return;
    if (auction.buyout_price > this.userDkp) {
      this.notificationService.error('DKP insuffisants', `Vous n'avez que ${this.userDkp} DKP disponibles.`);
      return;
    }
    if (confirm(`Acheter "${auction.item_name}" pour ${auction.buyout_price} DKP ?`)) {
      this.auctionService.buyout(auction.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Achat réussi !', `Vous avez acheté "${auction.item_name}" pour ${auction.buyout_price} DKP.`);
            this.loadAuctions();
          } else {
            this.notificationService.error('Erreur', response.message || 'Erreur lors de l\'achat');
          }
        },
        error: (error) => {
          this.notificationService.error('Erreur', error.error?.message || 'Erreur lors de l\'achat');
        }
      });
    }
  }
getAuctionStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'En cours';
    case 'upcoming': return 'À venir';
    case 'ended': return 'Terminée';
    case 'cancelled': return 'Annulée';
    default: return 'Inconnu';
  }
}
  deleteAuction(auction: Auction) {
    if (auction.status === 'ended') {
      this.notificationService.error('Impossible', 'Vous ne pouvez pas annuler une enchère terminée.');
      return;
    }
    if (!this.isGuildOwner) {
      this.notificationService.error('Accès refusé', 'Seul le propriétaire de la guilde peut supprimer des enchères.');
      return;
    }
    if (confirm(`Supprimer l'enchère "${auction.item_name}" ?`)) {
      this.auctionService.deleteAuction(auction.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Enchère annulée', `L'enchère "${auction.item_name}" a été annulée.`);
            this.loadAuctions();
          } else {
            this.notificationService.error('Erreur', response.message || 'Erreur lors de la suppression');
          }
        },
        error: (error) => {
          this.notificationService.error('Erreur', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  get filteredAuctions(): Auction[] {

    if (this.tab === 'active') {
      return this.auctions.filter(a => a.status === 'active');
    }
    if (this.tab === 'upcoming') {
      return this.auctions.filter(a => a.status === 'upcoming');
    }
    return this.auctions;
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  formatDateForBackend(localDateTime: string): string {
    if (!localDateTime) return '';
    const [datePart, timePart] = localDateTime.split('T');
    if (!datePart || !timePart) return localDateTime;
    return `${datePart} ${timePart}:00`;
  }
  getAuctionStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'auction-status-active';
    case 'upcoming': return 'auction-status-upcoming';
    case 'ended': return 'auction-status-ended';
    case 'cancelled': return 'auction-status-cancelled';
    default: return 'auction-status-default';
  }
}
}

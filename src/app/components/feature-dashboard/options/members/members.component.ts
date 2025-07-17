import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuildService } from '../../../../services/guild/guild.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  private guildService = inject(GuildService);
  
  members: any[] = [];
  guild: any = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.loadGuildMembers();
  }

  loadGuildMembers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.guildService.getGuildMembers().subscribe({
      next: (response) => {
        if (response.success) {
          this.guild = response.guild;
          this.members = response.members;
          console.log('✅ Membres chargés:', this.members);
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement membres:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des membres';
        this.isLoading = false;
      }
    });
  }

  getPlayerStatusBadge(member: any): string {
    if (!member.player) return 'no-profile';
    return 'has-profile';
  }

  getPlayerStatusText(member: any): string {
    if (!member.player) return 'Aucun profil';
    return 'Profil actif';
  }

  getMemberRoleBadge(member: any): string {
    return member.is_owner ? 'owner' : 'member';
  }

  getMemberRoleText(member: any): string {
    return member.is_owner ? 'Propriétaire' : 'Membre';
  }

  sortMembersByDKP() {
    this.members.sort((a, b) => {
      const dkpA = a.player?.dkp || 0;
      const dkpB = b.player?.dkp || 0;
      return dkpB - dkpA; // Tri décroissant
    });
  }

  sortMembersByLevel() {
    this.members.sort((a, b) => {
      const levelA = a.player?.level || 0;
      const levelB = b.player?.level || 0;
      return levelB - levelA; // Tri décroissant
    });
  }

  sortMembersByName() {
    this.members.sort((a, b) => {
      const nameA = a.player?.name || a.username || '';
      const nameB = b.player?.name || b.username || '';
      return nameA.localeCompare(nameB);
    });
  }
}

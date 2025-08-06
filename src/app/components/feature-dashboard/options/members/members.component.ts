import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ AJOUTER
import { GuildService } from '../../../../services/guild/guild.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ AJOUTER RouterModule
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  private guildService = inject(GuildService);
  
  members: any[] = [];
  guild: any = null;
  isLoading = true;
  errorMessage = '';
  currentSort: string = '';

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

  // Méthodes pour les stats
  getMembersWithProfile(): number {
    return this.members.filter(member => member.player).length;
  }

  getAverageLevel(): number {
    const membersWithLevel = this.members.filter(member => member.player?.level);
    if (membersWithLevel.length === 0) return 0;
    
    const totalLevel = membersWithLevel.reduce((sum, member) => sum + (member.player.level || 0), 0);
    return Math.round(totalLevel / membersWithLevel.length);
  }

  getTotalDKP(): number {
    return this.members.reduce((sum, member) => sum + (member.player?.dkp || 0), 0);
  }

  // Méthodes de tri améliorées
  sortMembersByDKP() {
    this.currentSort = 'dkp';
    this.members.sort((a, b) => {
      const dkpA = a.player?.dkp || 0;
      const dkpB = b.player?.dkp || 0;
      return dkpB - dkpA;
    });
  }

  sortMembersByLevel() {
    this.currentSort = 'level';
    this.members.sort((a, b) => {
      const levelA = a.player?.level || 0;
      const levelB = b.player?.level || 0;
      return levelB - levelA;
    });
  }

  sortMembersByName() {
    this.currentSort = 'name';
    this.members.sort((a, b) => {
      const nameA = a.player?.name || a.username || '';
      const nameB = b.player?.name || b.username || '';
      return nameA.localeCompare(nameB);
    });
  }

  sortMembersByRole() {
    this.currentSort = 'role';
    this.members.sort((a, b) => {
      if (a.is_owner && !b.is_owner) return -1;
      if (!a.is_owner && b.is_owner) return 1;
      return 0;
    });
  }

  // Affichage des classes
  getClassDisplayName(classKey: string): string {
    const classNames: { [key: string]: string } = {
      'tank': '🛡️ Tank',
      'dps': '⚔️ DPS', 
      'support': '🩹 Support',
      'range': '🏹 Range',
      'mage': '🔮 Mage'
    };
    return classNames[classKey] || classKey;
  }
  
}

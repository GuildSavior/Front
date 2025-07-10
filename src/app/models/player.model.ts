// Infos du joueur en jeu
export interface Player {
  classe: 'support' | 'tank' | 'dps' | 'range' | 'mage';
  level?: number;
  events_joined?: number;
  main_weapon?: string;
  // Ajoute d'autres propriétés jeu ici
}
// Infos du joueur en jeu
export interface Player {
  classe: PlayerClass;
  level?: number;
  events_joined?: number;
  main_weapon?: string;
  // Ajoute d'autres propriétés jeu ici
}
export type PlayerClass = 'dps' | 'support' | 'tank' | 'range' | 'mage';
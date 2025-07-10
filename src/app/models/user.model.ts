// user.model.ts
export interface User {
  id: number;
  discord_id: string;
  username: string | null;
  email: string | null;
  avatar: string | null;
  remember_token: string | null;
  role_id: number | null;
  guild_id: number | null;
  refresh_token: string | null;
  statut: string;
  total_dkp: number;
  created_at: string;
  updated_at: string;
}

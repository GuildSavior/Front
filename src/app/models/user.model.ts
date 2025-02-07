// user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  discord_id: string;
  avatar: string;
  statut: string;
  total_dkp: number;
  created_at: string;
  updated_at: string;
  username: string | null;
  refresh_token: string | null;
  guild_id: string | null;
  role_id: string | null;
}

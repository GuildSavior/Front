// user.model.ts
export interface Subscription {
  id: number;
  user_id: number;
  plan_type: string;
  status: string;
  price: string;
  payment_method: string | null;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

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
  is_premium: boolean;
  subscription: Subscription | null;
  guild: any | null;
  role: any | null;
  created_at: string;
  updated_at: string;
}

export interface Guild {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: number;
  member_count?: number;
  max_members?: number;
}
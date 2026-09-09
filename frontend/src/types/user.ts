export interface User {
  id: string;
  email: string;
  username?: string | null;
  first_name: string;
  last_name: string;
  bio?: string | null;
  location?: string | null;
  account_type: string;
  status: string;
  is_email_verified: boolean;
  is_admin: boolean;
  is_moderator: boolean;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  deleted_at?: string | null;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
export type AccountType = "user" | "professional" | "business";

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  first_name: string;
  last_name: string;
  bio?: string | null;
  location?: string | null;
  account_type: AccountType;
  status: string;
  is_email_verified: boolean;
  is_admin: boolean;
  is_moderator: boolean;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email?: string;
  code: string;
  new_password: string;
}

export interface VerifyCodeData {
  code: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_type: string;
  is_admin: boolean;
  is_moderator: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}
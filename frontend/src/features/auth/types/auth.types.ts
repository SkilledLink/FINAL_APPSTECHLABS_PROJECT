// src/features/auth/types/auth.types.ts

export type AccountType = "user" | "professional" | "business";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: AccountType;
  is_admin: boolean;
  is_moderator: boolean;
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
  account_type?: AccountType; // optional, defaults to "user" on backend
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email?: string;   // optional – some flows pass it from URL
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
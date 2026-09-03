<<<<<<< HEAD
export type AccountType = "client" | "professional" | "business";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
}

export interface LoginCredentials {
  email: string;
  password: string;
  accountType: "client" | "professional";
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: AccountType;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface MessageResponse {
  message: string;
}
=======
export type AuthView = 'login' | 'register';
export type AccountType = 'CLIENT' | 'INDIVIDUAL' | 'BUSINESS';

export interface User {
  id: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: 'CLIENT' | 'PROFESSIONAL';
}

export interface RegisterPayload {
  accountType: AccountType;
  fullName?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
>>>>>>> 068172ec0a0ac18df41f431507b0fe7a6030a66c

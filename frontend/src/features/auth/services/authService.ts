import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  AuthUser,
  MessageResponse,
} from "../types/auth.types";

/**
 * Frontend-only mock. No network calls, no backend.
 * Swap the bodies of these functions for real API calls whenever
 * a backend is ready — the components/hook never need to change.
 */

const FAKE_DELAY = 900;

function delay<T>(value: T, ms = FAKE_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fakeUser(email: string, name: string, accountType: AuthUser["accountType"]): AuthUser {
  return { id: crypto.randomUUID?.() ?? String(Date.now()), name, email, accountType };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error("Enter your email and password.");
    }
    const user = fakeUser(credentials.email, credentials.email.split("@")[0], credentials.accountType);
    return delay({ user, token: "mock-token" });
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    if (!data.name || !data.email || data.password.length < 8) {
      throw new Error("Check your details and try again.");
    }
    const user = fakeUser(data.email, data.name, data.accountType);
    return delay({ user, token: "mock-token" });
  },

  async forgotPassword(data: ForgotPasswordData): Promise<MessageResponse> {
    if (!data.email) throw new Error("Enter your email address.");
    return delay({ message: "If an account exists, a reset link has been sent." });
  },

  async resetPassword(data: ResetPasswordData): Promise<MessageResponse> {
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters.");
    return delay({ message: "Password updated." });
  },

  logout(): void {
    localStorage.removeItem("auth_token");
  },
};
import type { AuthResponse } from '../types/auth.types';

export const authService = {
  login: async (email: string, _password: string): Promise<AuthResponse> => {
    // Simulate API call
    return new Promise((resolve) =>
      setTimeout(() => resolve({ user: { id: '1', email }, token: 'mock-jwt-token' }), 1000)
    );
  },
  register: async (email: string, _password: string): Promise<AuthResponse> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ user: { id: '2', email }, token: 'mock-jwt-token' }), 1000)
    );
  },
};

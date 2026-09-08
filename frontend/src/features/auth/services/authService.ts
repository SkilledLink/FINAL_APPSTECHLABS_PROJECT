// src/features/auth/services/authService.ts

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: any; // UserResponse from backend
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  async logout(): Promise<void> {
    // Optional: call logout endpoint if exists
    localStorage.removeItem('access_token');
  },

  async getCurrentUser(): Promise<any> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No token');
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }
    return response.json();
  },
};



































// import type {
//   LoginCredentials,
//   RegisterData,
//   ForgotPasswordData,
//   ResetPasswordData,
//   AuthResponse,
//   AuthUser,
//   MessageResponse,
// } from "../types/auth.types";

// /**
//  * Frontend-only mock. No network calls, no backend.
//  * Swap the bodies of these functions for real API calls whenever
//  * a backend is ready — the components/hook never need to change.
//  */

// const FAKE_DELAY = 900;

// function delay<T>(value: T, ms = FAKE_DELAY): Promise<T> {
//   return new Promise((resolve) => setTimeout(() => resolve(value), ms));
// }

// function fakeUser(email: string, name: string, accountType: AuthUser["accountType"]): AuthUser {
//   return { id: crypto.randomUUID?.() ?? String(Date.now()), name, email, accountType };
// }

// export const authService = {
//   async login(credentials: LoginCredentials): Promise<AuthResponse> {
//     if (!credentials.email || !credentials.password) {
//       throw new Error("Enter your email and password.");
//     }
//     const user = fakeUser(credentials.email, credentials.email.split("@")[0], credentials.accountType);
//     return delay({ user, token: "mock-token" });
//   },

//   async register(data: RegisterData): Promise<AuthResponse> {
//     if (!data.name || !data.email || data.password.length < 8) {
//       throw new Error("Check your details and try again.");
//     }
//     const user = fakeUser(data.email, data.name, data.accountType);
//     return delay({ user, token: "mock-token" });
//   },

//   async forgotPassword(data: ForgotPasswordData): Promise<MessageResponse> {
//     if (!data.email) throw new Error("Enter your email address.");
//     return delay({ message: "If an account exists, a reset link has been sent." });
//   },

//   async resetPassword(data: ResetPasswordData): Promise<MessageResponse> {
//     if (data.password.length < 8) throw new Error("Password must be at least 8 characters.");
//     return delay({ message: "Password updated." });
//   },

//   logout(): void {
//     localStorage.removeItem("auth_token");
//   },
// };
// import type { AuthResponse } from '../types/auth.types';

// export const authService = {
//   login: async (email: string, _password: string): Promise<AuthResponse> => {
//     // Simulate API call
//     return new Promise((resolve) =>
//       setTimeout(() => resolve({ user: { id: '1', email }, token: 'mock-jwt-token' }), 1000)
//     );
//   },
//   register: async (email: string, _password: string): Promise<AuthResponse> => {
//     return new Promise((resolve) =>
//       setTimeout(() => resolve({ user: { id: '2', email }, token: 'mock-jwt-token' }), 1000)
//     );
//   },
// };



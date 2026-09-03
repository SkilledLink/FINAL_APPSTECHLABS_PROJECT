<<<<<<< HEAD
import { useCallback, useState } from "react";
import { authService } from "../services/authService";
import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthUser,
} from "../types/auth.types";

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  forgotPassword: (data: ForgotPasswordData) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  clearError: () => void;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      localStorage.setItem("auth_token", res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      localStorage.setItem("auth_token", res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset link.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, loading, error, login, register, forgotPassword, resetPassword, clearError };
}
=======
import { useState } from 'react';
import { AuthView } from '../types/auth.types';

export const useAuth = (initialView: AuthView = 'splash') => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);

  const navigateTo = (view: AuthView) => setCurrentView(view);

  return { currentView, navigateTo, loading, setLoading };
};
>>>>>>> 068172ec0a0ac18df41f431507b0fe7a6030a66c

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { apiClient } from "../../../api/client";
import type {
  AuthUser,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
} from "../types/auth.types";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setAuthLoading(false);
  }, []);

  const clearError = () => setError(null);

  /* ── helper: persist tokens + fetch /users/me ───────────── */
  const persistSession = async (
    access_token: string,
    refresh_token?: string,
  ): Promise<AuthUser | null> => {
    localStorage.setItem("access_token", access_token);
    if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

    try {
      const { data } = await apiClient.get<AuthUser>("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch {
      return null;
    }
  };

  /* ── LOGIN ──────────────────────────────────────────────── */
  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; unverified?: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const { data: loginData } = await apiClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const userData = await persistSession(
        loginData.access_token,
        loginData.refresh_token,
      );

      toast.success("Welcome back! 🎉");
      return { success: !!userData };
    } catch (err: any) {
      const statusCode = err.response?.status;
      const msg =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";

      const unverified =
        statusCode === 403 &&
        String(msg).toLowerCase().includes("not verified");

      setError(msg);
      if (!unverified) toast.error(msg);

      return { success: false, unverified };
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER ───────────────────────────────────────────── */
  const register = async (
    data: RegisterData,
  ): Promise<{
    success: boolean;
    user_id?: string;
    /** True when register returned tokens and we stored them (no verify-email needed). */
    autoLoggedIn?: boolean;
  }> => {
    setLoading(true);
    setError(null);
    try {
      const { data: payload } = await apiClient.post("/auth/register", {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });

      // Case A — backend returned tokens on register → we're already logged in.
      if (payload?.access_token) {
        const userData = await persistSession(
          payload.access_token,
          payload.refresh_token,
        );
        toast.success("Account created! 🎉");
        return {
          success: true,
          user_id: payload.user_id ?? userData?.id,
          autoLoggedIn: true,
        };
      }

      // Case B — backend requires email verification first.
      // Nothing to persist yet. VerifyEmailPage will handle token storage.
      toast.success("Account created! Please verify your email.");
      return {
        success: true,
        user_id: payload?.user_id,
        autoLoggedIn: false,
      };
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Registration failed.";
      setError(msg);
      toast.error(msg);
      return { success: false, autoLoggedIn: false };
    } finally {
      setLoading(false);
    }
  };

  /* ── VERIFY EMAIL ───────────────────────────────────────── */
  const verifyEmail = async (
    email: string,
    code: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post("/auth/verify-email", {
        email,
        code,
      });

      const userData = await persistSession(
        data.access_token,
        data.refresh_token,
      );

      toast.success("Email verified! 🎉");
      return !!userData;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Invalid or expired verification code.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ── RESEND VERIFICATION ────────────────────────────────── */
  const resendVerification = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/resend-verification", { email });
      toast.success("A new verification code has been sent.");
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Couldn't resend the code. Please try again.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ── FORGOT PASSWORD ────────────────────────────────────── */
  const forgotPassword = async (
    data: ForgotPasswordData,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/password-reset/request", {
        email: data.email,
      });
      toast.success("If an account exists, a reset code has been sent.");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to send reset code.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ── RESET PASSWORD ─────────────────────────────────────── */
  const resetPassword = async (
    data: ResetPasswordData,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/password-reset/confirm", {
        email: data.email,
        code: data.code,
        new_password: data.new_password,
      });
      toast.success("Password reset successfully! Please log in.");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to reset password.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGOUT ─────────────────────────────────────────────── */
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Logged out.");
  };

  /* ── REFRESH USER ───────────────────────────────────────── */
  const refreshUser = async (): Promise<AuthUser | null> => {
    try {
      const { data } = await apiClient.get<AuthUser>("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch {
      return null;
    }
  };

  const getCurrentUser = (): AuthUser | null => user;
  const isAuthenticated = (): boolean =>
    Boolean(localStorage.getItem("access_token"));

  return {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    refreshUser,
    getCurrentUser,
    isAuthenticated,
    loading,
    authLoading,
    error,
    clearError,
    user,
  };
}
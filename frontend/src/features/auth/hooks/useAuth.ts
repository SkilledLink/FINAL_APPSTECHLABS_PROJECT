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

  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; unverified?: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await apiClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      const loginData = loginResponse.data;

      localStorage.setItem("access_token", loginData.access_token);
      localStorage.setItem("refresh_token", loginData.refresh_token);

      const userResponse = await apiClient.get("/users/me");
      const userData = userResponse.data as AuthUser;

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Welcome back! 🎉");
      return { success: true };
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

  const register = async (
    data: RegisterData,
  ): Promise<{ success: boolean; user_id?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/register", {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });
      toast.success("Account created! Please verify your email.");
      return { success: true, user_id: response.data.user_id };
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Registration failed.";
      setError(msg);
      toast.error(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/verify-email", {
        email,
        code,
      });
      const { access_token, refresh_token } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const userResponse = await apiClient.get("/users/me");
      const userData = userResponse.data as AuthUser;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Email verified! 🎉");
      return true;
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

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Logged out.");
  };

  const refreshUser = async (): Promise<AuthUser | null> => {
    try {
      const res = await apiClient.get("/users/me");
      const userData = res.data as AuthUser;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
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
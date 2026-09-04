// src/features/auth/hooks/useAuth.ts
import { useState } from "react";
import { apiClient } from "../../../api/client";
import { toast } from "react-toastify";
import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../types/auth.types";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Login – get tokens
      const loginResponse = await apiClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      const loginData = loginResponse.data;

      // Store tokens
      localStorage.setItem("access_token", loginData.access_token);
      localStorage.setItem("refresh_token", loginData.refresh_token);

      // 2. Fetch full user profile using the token
      const userResponse = await apiClient.get("/users/me");
      const userData = userResponse.data;

      // 3. Store the FULL user object (it has id, email, name, etc.)
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Welcome back! 🎉");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ... (register, verifyEmail, forgotPassword, resetPassword, logout, getCurrentUser, isAuthenticated) remain the same as before

  // For completeness, include the rest unchanged:
  const register = async (data: RegisterData): Promise<{ success: boolean; user_id?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/register", {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        account_type: data.account_type || "user",
      });
      const user_id = response.data.user_id;
      toast.success("Account created! Please verify your email.");
      return { success: true, user_id };
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
      await apiClient.post("/auth/verify-email", { email, code });
      toast.success("Email verified successfully! You can now log in.");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Invalid or expired verification code.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/password-reset/request", { email: data.email });
      toast.success("If an account exists, a reset link has been sent.");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to send reset link.";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
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
    localStorage.removeItem("pending_verification_user_id");
    toast.info("Logged out.");
  };

  const getCurrentUser = (): any | null => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  };

  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("access_token");
  };

  return {
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    getCurrentUser,
    isAuthenticated,
    loading,
    error,
    clearError,
  };
}
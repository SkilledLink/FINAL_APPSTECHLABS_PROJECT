// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '../../../api/client';
import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
} from '../types/auth.types';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      const data = response.data as AuthResponse;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Welcome back! 🎉');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; user_id?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        account_type: data.account_type || 'user',
      });
      const user_id = response.data.user_id;
      toast.success('Account created! Please verify your email.');
      return { success: true, user_id };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed.';
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
      await apiClient.post('/auth/verify-email', { email, code }); // ✅ both fields
      toast.success('Email verified successfully! You can now log in.');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid or expired verification code.';
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
      await apiClient.post('/auth/password-reset/request', { email: data.email });
      toast.success('If an account exists, a reset link has been sent.');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to send reset link.';
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
      await apiClient.post('/auth/password-reset/confirm', {
        email: data.email,
        code: data.code,
        new_password: data.new_password,
      });
      toast.success('Password reset successfully! Please log in.');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to reset password.';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_verification_user_id');
    toast.info('Logged out.');
  };

  const getCurrentUser = (): AuthResponse | null => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData) as AuthResponse;
      } catch {
        return null;
      }
    }
    return null;
  };

  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('access_token');
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

// src/features/users/hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../../api/client';
import { toast } from 'react-toastify';

export function useUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;

    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getMe();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to load user profile.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userApi.updateMe(data);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success("Profile updated successfully!");
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to update profile.";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userApi.uploadAvatar(file);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success("Avatar uploaded successfully!");
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to upload avatar.";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    user,
    loading,
    error,
    fetchCurrentUser,
    updateUser,
    uploadAvatar,
    clearError,
  };
}
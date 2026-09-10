// src/providers/AuthProvider.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../features/profile/types/profile.types';
import { authService } from '../features/auth/services/authService';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        } catch {
          localStorage.removeItem('access_token');
          setCurrentUser(null);
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({
      email,
      password,
    });

    localStorage.setItem('access_token', response.access_token);
    setCurrentUser(response.user);
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await authService.register(data);

    localStorage.setItem('access_token', response.access_token);
    setCurrentUser(response.user);
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('access_token');
    setCurrentUser(null);
  };

  const updateUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const isAuthenticated = () =>
    !!currentUser && !!localStorage.getItem('access_token');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
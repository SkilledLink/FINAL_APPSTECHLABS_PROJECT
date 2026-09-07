// src/providers/AuthProvider.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import type { UserProfile } from '../features/profile/types/profile.types';
import { profileService } from '../features/profile/services/profileService';

interface AuthContextType {
  currentUser: UserProfile | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  /**
   * Load the default user when the application starts.
   * This is currently using the demo professional account.
   */
  useEffect(() => {
    let mounted = true;

    const loadDefaultUser = async () => {
      try {
        const user = await profileService.getProfileById('user_2');

        if (mounted) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to load default user:', error);

        if (mounted) {
          setCurrentUser(null);
        }
      }
    };

    loadDefaultUser();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Login a user by their ID.
   */
  const login = async (userId: string): Promise<void> => {
    try {
      const user = await profileService.getProfileById(userId);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to login user:', error);
      throw error;
    }
  };

  /**
   * Logout the current user.
   */
  const logout = (): void => {
    setCurrentUser(null);
  };

  /**
   * Update the currently authenticated user's profile.
   */
  const updateUser = (user: UserProfile): void => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Access authentication state and actions.
 */
// The hook is kept as part of this provider module to preserve the existing API.
// It is intentionally excluded from the Fast Refresh component-export rule.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Make sure your component is rendered inside <AuthProvider>.'
    );
  }

  return context;
};
// ```

// **Important:** this file alone will not eliminate your error if `ProfilePage` is still outside the provider.

// Your component tree must be:

// ```text
// AuthProvider
//     └── BrowserRouter
//           └── App
//                 └── ProfilePage
//                       └── useAuth()
// ```

// So if you give me your current **`main.tsx`**, I can give you the exact completed corrected file too.

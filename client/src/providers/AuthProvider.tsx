import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '@/lib/api/auth';
import * as usersApi from '@/lib/api/users';
import { User, LoginCredentials, RegisterCredentials } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const currentUser = authApi.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Optionally fetch fresh user data
            try {
              const freshUser = await usersApi.getProfile();
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            } catch (error) {
              // If profile fetch fails, keep using cached user
              console.error('Failed to fetch fresh user profile:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
    // Components should handle navigation after successful login
  };

  const register = async (credentials: RegisterCredentials) => {
    await authApi.register(credentials);
    // Registration successful - user needs to verify email
    // Components should handle showing success message or redirecting
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Components should handle navigation after logout
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await usersApi.getProfile();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

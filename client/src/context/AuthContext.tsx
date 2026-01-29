import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../api/auth.api';
import { getProfile } from '../api/user.api';
import { User, AuthContextValue } from '../types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const userProfile = await getProfile();
          setUser({ ...userProfile, token });
        } catch (e) {
          console.error('Failed to fetch profile', e);
          localStorage.removeItem('userToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login({ email, password });
    
    // Store tokens
    localStorage.setItem('userToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // Set user state
    setUser({ 
      ...response.user,
      token: response.accessToken 
    });
  };

  const logout = (): void => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    return authApi.register({ name, email, password });
  };

  const value: AuthContextValue = { user, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

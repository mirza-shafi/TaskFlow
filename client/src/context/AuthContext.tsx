import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../api/auth.api';
import { User, AuthContextValue } from '../types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ token, name: decoded.name, email: decoded.email });
      } catch (e) {
        setUser({ token, name: '', email: '' });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const userData = await authApi.login({ email, password });
    localStorage.setItem('userToken', userData.token);
    setUser(userData);
  };

  const logout = (): void => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const register = (name: string, email: string, password: string) => {
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

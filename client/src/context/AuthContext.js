import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ token, name: decoded.name, email: decoded.email });
      } catch (e) {
        setUser({ token });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await api.login({ email, password });
    localStorage.setItem('userToken', userData.token);
    setUser(userData);
  };

  // The logout function ONLY clears the user's state.
  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const register = (name, email, password) => {
    return api.register({ name, email, password });
  };

  const value = { user, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
import React, { useEffect, useRef, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { SettingsProvider } from './context/SettingsContext';

// Import your page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodoListPage from './pages/TodoListPage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import BinPage from './pages/BinPage';
import NotePage from './pages/NotePage';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// This component contains the logic for handling the logout redirect
function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const previousUser = useRef( user);

  useEffect(() => {
    // Check if the user state changed from "logged in" to "logged out"
    if (previousUser.current && !user) {
      navigate('/'); // If so, redirect to the homepage
    }
    // Update the ref for the next render
    previousUser.current = user;
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <TodoListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/todo" 
        element={
          <ProtectedRoute>
            <TodoListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/statistics" 
        element={
          <ProtectedRoute>
            <StatisticsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bin" 
        element={
          <ProtectedRoute>
            <BinPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/note" 
        element={
          <ProtectedRoute>
            <NotePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppearanceProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AppearanceProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

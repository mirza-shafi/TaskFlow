import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import your page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodoListPage from './pages/TodoListPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// This new component contains the logic for handling the logout redirect
function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const previousUser = useRef(user);

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
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
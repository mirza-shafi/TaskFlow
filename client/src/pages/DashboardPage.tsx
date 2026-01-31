import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Hello, {user?.name || 'User'}! 👋</h1>
        <p className="welcome-message">Welcome to TaskFlow</p>
        
        <div className="user-info">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Status:</strong> <span className="status-badge">Active</span></p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;

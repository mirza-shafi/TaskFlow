import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/user.api';
import { FiSettings, FiBarChart2, FiLogOut, FiChevronDown, FiUser } from 'react-icons/fi';
import './ProfileMenu.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface ProfileMenuProps {
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userApi.getProfile();
        if (profile.avatarUrl) {
          setAvatarUrl(profile.avatarUrl);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          {avatarUrl ? (
            <img 
              src={`${API_URL}${avatarUrl}`} 
              alt="Profile"
            />
          ) : (
            user?.name ? getInitials(user.name) : <FiUser />
          )}
        </div>
        <FiChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-avatar-lg">
              {avatarUrl ? (
                <img 
                  src={`${API_URL}${avatarUrl}`} 
                  alt="Profile"
                />
              ) : (
                user?.name ? getInitials(user.name) : <FiUser />
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user?.name || 'User'}</div>
              <div className="profile-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <button
              className="dropdown-item"
              onClick={() => handleNavigation('/settings')}
            >
              <FiSettings className="dropdown-icon" />
              <span>Settings</span>
            </button>

            <button
              className="dropdown-item"
              onClick={() => handleNavigation('/statistics')}
            >
              <FiBarChart2 className="dropdown-icon" />
              <span>Statistics</span>
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <button
              className="dropdown-item danger"
              onClick={handleLogout}
            >
              <FiLogOut className="dropdown-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface ProfileMenuProps {
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // This effect closes the menu if you click outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to get user's initials from their name
  const getInitials = (name: string = 'User'): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button className="avatar-btn" onClick={() => setIsOpen(!isOpen)}>
        {getInitials(user?.name)}
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <Link to="/settings" className="dropdown-item">
            Settings
          </Link>
          <button onClick={onLogout} className="dropdown-item dropdown-logout">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

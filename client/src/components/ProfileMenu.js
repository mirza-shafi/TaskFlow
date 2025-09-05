import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef(null);

  // This effect closes the menu if you click outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to get user's initials from their name
  const getInitials = (name = 'User') => {
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
          <button onClick={onLogout} className="dropdown-item dropdown-logout">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
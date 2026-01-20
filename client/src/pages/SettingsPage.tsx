import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppearance } from '../context/AppearanceContext';
import * as userApi from '../api/user.api';
import { uploadAvatar } from '../api/uploadAvatar.api';
import {
  FiX, FiUser, FiAward, FiGrid, FiFilter, FiBell, FiClock,
  FiMonitor, FiMoreHorizontal, FiDownload, FiUsers, FiCommand,
  FiInfo, FiUpload, FiCheck, FiArrowLeft, FiChevronRight
} from 'react-icons/fi';
import './SettingsPage.css';

type SettingsSection = 'account' | 'appearance' | 'notifications' | 'about';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { fontSize, setFontSize, theme, setTheme } = useAppearance();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle Resize for Mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowMobileSidebar(false); // Reset on desktop
      else if (!showMobileSidebar) setShowMobileSidebar(true); // Reset to sidebar on mobile init if needed
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile({
          name: data.name,
          email: data.email,
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSectionClick = (section: SettingsSection) => {
    setActiveSection(section);
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowMobileSidebar(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await userApi.updateProfile({ name: profile.name, bio: profile.bio });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Profile update error:', error);
      setMessage(error?.response?.data?.message || 'Failed to update profile.');
    } finally {
        setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      const result = await uploadAvatar(file);
      setProfile({ ...profile, avatarUrl: result.avatarUrl });
      setMessage('Avatar uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setMessage(error?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <aside className="settings-sidebar">
       <button
        className={`sidebar-item ${activeSection === 'account' ? 'active' : ''}`}
        onClick={() => handleSectionClick('account')}
      >
        <div className="sidebar-item-content">
            <FiUser /> Account
        </div>
        {isMobile && <FiChevronRight className="chevron" />}
      </button>

      <button
        className={`sidebar-item ${activeSection === 'appearance' ? 'active' : ''}`}
        onClick={() => handleSectionClick('appearance')}
      >
        <div className="sidebar-item-content">
            <FiMonitor /> Appearance
        </div>
        {isMobile && <FiChevronRight className="chevron" />}
      </button>

      <button
        className={`sidebar-item ${activeSection === 'notifications' ? 'active' : ''}`}
        onClick={() => handleSectionClick('notifications')}
      >
        <div className="sidebar-item-content">
            <FiBell /> Notifications
        </div>
        {isMobile && <FiChevronRight className="chevron" />}
      </button>

        <button
        className={`sidebar-item ${activeSection === 'about' ? 'active' : ''}`}
        onClick={() => handleSectionClick('about')}
      >
        <div className="sidebar-item-content">
            <FiInfo /> About
        </div>
        {isMobile && <FiChevronRight className="chevron" />}
      </button>

      <div className="sidebar-divider" />
      
      {/* Disabled/Future Features */}
      {['Premium', 'Features', 'Smart List', 'Date & Time', 'Integrations'].map((item) => (
         <button key={item} className="sidebar-item" disabled>
             <div className="sidebar-item-content">
                <FiGrid /> {item}
             </div>
         </button>
      ))}
    </aside>
  );

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container-shadcn">
        {/* Header */}
        <div className="settings-header">
            {isMobile && !showMobileSidebar ? (
                <button className="back-btn" onClick={handleBackToSidebar}>
                    <FiArrowLeft />
                </button>
            ) : null}
            
          <h1>{isMobile && !showMobileSidebar ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Settings'}</h1>
          
          <button className="close-btn" onClick={() => navigate('/todo')}>
            <FiX />
          </button>
        </div>

        <div className="settings-content-layout">
          {/* On Mobile: Show Sidebar ONLY if showMobileSidebar is true */}
          {/* On Desktop: Always show Sidebar */}
          {(!isMobile || showMobileSidebar) && <SidebarContent />}

          {/* On Mobile: Show Main Content ONLY if showMobileSidebar is false */}
          {/* On Desktop: Always show Main Content */}
          {(!isMobile || !showMobileSidebar) && (
            <main className="settings-main-area">
            {activeSection === 'account' && (
              <div className="account-view">
                {/* Profile Group */}
                <h3 className="group-title">Profile</h3>
                <div className="settings-group">
                  <div className="group-row profile-row">
                    <div 
                      className="profile-avatar-small"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profile.avatarUrl ? (
                        <img src={`http://localhost:5001${profile.avatarUrl}`} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder-small">{getInitials(profile.name)}</div>
                      )}
                      <div className="avatar-upload-overlay-small">
                        <FiUpload size={14} />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <div className="profile-info-compact">
                      <h2 className="account-name-small">{profile.name}</h2>
                      <span className="premium-status-small">Free Plan</span>
                    </div>
                  </div>

                  <div className="group-row">
                    <span className="row-label">Name</span>
                    <input 
                      type="text" 
                      className="setting-input-ghost"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>

                  <div className="group-row">
                    <span className="row-label">Bio</span>
                    <textarea
                      className="setting-textarea-ghost"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Add a bio..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Security Group */}
                <h3 className="group-title">Security</h3>
                <div className="settings-group">
                  <div className="group-row">
                    <span className="row-label">Email</span>
                    <span className="row-value">{profile.email}</span>
                  </div>
                  <div className="group-row">
                    <span className="row-label">Password</span>
                    <button className="row-action">Change Password</button>
                  </div>
                  <div className="group-row">
                    <span className="row-label">2-Step Verification</span>
                    <button className="row-action">Setup</button>
                  </div>
                </div>

                {/* Connections Group */}
                <h3 className="group-title">Connections</h3>
                <div className="settings-group">
                  <div className="group-row">
                    <span className="row-label">Google</span>
                    <span className="row-value">{profile.name}</span>
                  </div>
                  <div className="group-row">
                    <span className="row-label">Apple</span>
                    <button className="row-action">Link</button>
                  </div>
                </div>

                {/* Data Group */}
                <h3 className="group-title">Data</h3>
                <div className="settings-group">
                  <div className="group-row">
                    <span className="row-label">Backup & Restore</span>
                    <div className="row-actions-group">
                      <button className="row-action">Generate</button>
                      <button className="row-action">Import</button>
                    </div>
                  </div>
                  <div className="group-row">
                    <span className="row-label">Account</span>
                    <button className="row-action danger">Delete</button>
                  </div>
                </div>

                {/* Save Action */}
                <div className="settings-footer-floating">
                  {message && <span className={`status-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</span>}
                  <button 
                    className="save-btn-primary" 
                    onClick={handleSave}
                    disabled={loading || uploading}
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h3 className="section-title">Appearance</h3>
                <div className="setting-row">
                  <span className="setting-label">Theme</span>
                  <select 
                    className="setting-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Font Size</span>
                  <select 
                    className="setting-select" 
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="appearance-preview">
                  <p>Preview: This is how your text will look in the selected theme</p>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3 className="section-title">Notifications</h3>
                <div className="setting-row">
                  <span className="setting-label">Email Notifications</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Push Notifications</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Task Reminders</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div className="settings-section">
                <h3 className="section-title">About TaskFlow</h3>
                <div className="about-content">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Build:</strong> Production</p>
                  <p style={{ marginTop: '20px', color: '#6b7280', lineHeight: '1.6' }}>
                    TaskFlow is a modern task management application designed to help you stay organized and productive.
                  </p>
                </div>
              </div>
            )}
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

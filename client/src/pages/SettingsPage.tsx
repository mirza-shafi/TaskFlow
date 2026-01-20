import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/user.api';
import { FiArrowLeft, FiCamera, FiSave, FiUser, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile({
          name: data.name,
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await userApi.updateProfile(profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => navigate('/todo'), 1500);
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-layout">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-card"
      >
        <div className="settings-header">
          <button onClick={() => navigate('/todo')} className="back-btn">
            <FiArrowLeft /> Back to Tasks
          </button>
          <h1>Profile Settings</h1>
        </div>

        <form onSubmit={handleSave} className="settings-form">
          <div className="avatar-section">
            <div className="avatar-preview">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder"><FiUser /></div>
              )}
              <div className="avatar-overlay">
                <FiCamera />
              </div>
            </div>
            <div className="avatar-input-group">
              <label>Avatar URL</label>
              <input 
                type="text" 
                value={profile.avatarUrl}
                onChange={(e) => setProfile({...profile, avatarUrl: e.target.value})}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <div className="input-group">
            <label><FiUser /> Full Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label><FiInfo /> Bio</label>
            <textarea 
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          {message && <div className={`status-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

          <button type="submit" className="save-btn" disabled={loading}>
            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      <style>{`
        .settings-layout {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }

        .settings-card {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          padding: 2.5rem;
          border: 1px solid #e2e8f0;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #5c6bc0;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1rem;
          padding: 0;
        }

        .settings-header h1 {
          font-size: 1.75rem;
          color: #1e293b;
          margin: 0;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: #f1f5f9;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .avatar-preview {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: #cbd5e1;
          flex-shrink: 0;
        }

        .avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .avatar-preview:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-input-group {
          flex-grow: 1;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #475569;
          font-size: 0.9rem;
        }

        .input-group input, .input-group textarea, .avatar-input-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .input-group input:focus, .input-group textarea:focus {
          outline: none;
          border-color: #5c6bc0;
          box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.1);
        }

        .save-btn {
          background: #5c6bc0;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: transform 0.2s, background 0.2s;
          margin-top: 1rem;
        }

        .save-btn:hover:not(:disabled) {
          background: #4a59a7;
          transform: translateY(-2px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status-msg {
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-msg.success { background: #dcfce7; color: #166534; }
        .status-msg.error { background: #fee2e2; color: #991b1b; }
      `}</style>
    </div>
  );
};

export default SettingsPage;

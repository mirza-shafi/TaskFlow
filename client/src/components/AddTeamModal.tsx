import React, { useState } from 'react';
import { FiX, FiUsers, FiMail } from 'react-icons/fi';
import './Modal.css';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeam: (name: string) => void;
}

const AddTeamModal: React.FC<AddTeamModalProps> = ({ isOpen, onClose, onCreateTeam }) => {
  const [teamName, setTeamName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onCreateTeam(teamName);
      setTeamName('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Team</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="team-name">
                <FiUsers size={14} />
                Team Name <span className="required">*</span>
              </label>
              <input
                id="team-name"
                type="text"
                className="form-input"
                placeholder="Enter team name..."
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                autoFocus
              />
              <p className="form-hint">
                <FiMail size={12} />
                You can invite members after creating the team
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FiUsers size={16} />
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;

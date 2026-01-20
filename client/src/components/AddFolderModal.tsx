import React, { useState } from 'react';
import { FiX, FiFolder, FiCheck } from 'react-icons/fi';
import './Modal.css';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFolder: (folderName: string, color: string) => void;
}

const FOLDER_COLORS = [
  { name: 'Blue', value: '#5b7fff' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#6b7280' },
];

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onClose, onAddFolder }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onAddFolder(folderName, selectedColor);
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0].value);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Folder</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="folder-name">
                <FiFolder size={14} />
                Folder Name <span className="required">*</span>
              </label>
              <input
                id="folder-name"
                type="text"
                className="form-input"
                placeholder="Enter folder name..."
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Choose Color</label>
              <div className="color-picker-grid">
                {FOLDER_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  >
                    {selectedColor === color.value && <FiCheck color="white" size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FiFolder size={16} />
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { CreateTaskPayload, TaskPriority } from '../types/task.types';
import { FiX, FiCalendar, FiFolder, FiUsers, FiAlertCircle } from 'react-icons/fi';
import './Modal.css';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: CreateTaskPayload) => void;
  folders: any[];
  teams: any[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, folders, teams }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Convert local date string to ISO string to preserve timezone
    let formattedDate = null;
    if (dueDate) {
        const d = new Date(dueDate);
        if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString();
        }
    }

    onAddTask({ 
      title, 
      description, 
      priority, 
      dueDate: formattedDate,
      folderId: folderId || undefined,
      teamId: teamId || undefined
    });
    onClose(); 
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setFolderId('');
    setTeamId('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Add New Task</h2>
          <button 
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Task Title <span className="required">*</span>
              </label>
              <input 
                id="task-title"
                type="text" 
                className="form-input"
                placeholder="Enter task title..."
                value={title} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required 
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-description">
                Description
              </label>
              <textarea 
                id="task-description"
                className="form-textarea"
                placeholder="Add task details..."
                rows={4}
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                <FiAlertCircle size={14} />
                Priority
              </label>
              <select 
                id="task-priority"
                className="form-select"
                value={priority} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Due Date & Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                <FiCalendar size={14} />
                Due Date & Time
              </label>
              <input 
                id="task-due-date"
                type="datetime-local"
                className="form-input"
                value={dueDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-grid">
              {/* Folder */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-folder">
                  <FiFolder size={14} />
                  Folder
                </label>
                <select 
                  id="task-folder"
                  className="form-select"
                  value={folderId} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFolderId(e.target.value)}
                >
                  <option value="">Personal (No Folder)</option>
                  {folders.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Team */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-team">
                  <FiUsers size={14} />
                  Team
                </label>
                <select 
                  id="task-team"
                  className="form-select"
                  value={teamId} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setTeamId(e.target.value)}
                >
                  <option value="">Private (No Team)</option>
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;

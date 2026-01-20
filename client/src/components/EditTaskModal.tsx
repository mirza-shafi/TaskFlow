import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Task, UpdateTaskPayload, TaskPriority } from '../types/task.types';
import { FiX, FiCalendar, FiFolder, FiUsers, FiAlertCircle, FiSave } from 'react-icons/fi';
import './Modal.css';

interface EditTaskModalProps {
  taskToEdit: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, taskData: UpdateTaskPayload) => void;
  folders: any[];
  teams: any[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ taskToEdit: task, isOpen, onClose, onUpdateTask, folders, teams }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setFolderId(task.folderId || '');
      setTeamId(task.teamId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onUpdateTask(task._id, { 
      title, 
      description, 
      priority, 
      dueDate: dueDate || null,
      folderId: folderId || undefined,
      teamId: teamId || undefined
    });
    onClose(); 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Task</h2>
          <button 
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-title">
                Task Title <span className="required">*</span>
              </label>
              <input 
                id="edit-task-title"
                type="text" 
                className="form-input"
                placeholder="Enter task title..."
                value={title} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-description">
                Description
              </label>
              <textarea 
                id="edit-task-description"
                className="form-textarea"
                placeholder="Add task details..."
                rows={4}
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-priority">
                <FiAlertCircle size={14} />
                Priority
              </label>
              <select 
                id="edit-task-priority"
                className="form-select"
                value={priority} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-due-date">
                <FiCalendar size={14} />
                Due Date
              </label>
              <input 
                id="edit-task-due-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-task-folder">
                  <FiFolder size={14} />
                  Folder
                </label>
                <select 
                  id="edit-task-folder"
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

              <div className="form-group">
                <label className="form-label" htmlFor="edit-task-team">
                  <FiUsers size={14} />
                  Team
                </label>
                <select 
                  id="edit-task-team"
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

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

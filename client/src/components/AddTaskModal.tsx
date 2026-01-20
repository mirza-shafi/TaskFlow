import React, { useState, FormEvent, ChangeEvent } from 'react';
import { CreateTaskPayload, TaskPriority } from '../types/task.types';

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
    onAddTask({ 
      title, 
      description, 
      priority, 
      dueDate: dueDate || null,
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>Description</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label>Priority</label>
            <select value={priority} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as TaskPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label>Due Date</label>
            <input 
              type="date"
              value={dueDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label>Folder (Optional)</label>
            <select value={folderId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFolderId(e.target.value)}>
              <option value="">Personal (No Folder)</option>
              {folders.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Team Workspace (Optional)</label>
            <select value={teamId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setTeamId(e.target.value)}>
              <option value="">Private (No Team)</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;

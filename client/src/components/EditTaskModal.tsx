import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Task, UpdateTaskPayload, TaskPriority } from '../types/task.types';

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

  // This effect runs when the 'task' prop changes
  // It populates the form with the existing task's data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setFolderId(task.folderId || '');
      setTeamId(task.teamId || '');
      // Format the date correctly for the input[type=date]
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Task</h2>
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
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

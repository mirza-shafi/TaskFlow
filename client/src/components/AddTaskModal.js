import React, { useState } from 'react';

export default function AddTaskModal({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask({ title, description, priority, dueDate });
    onClose(); // Close modal after submitting
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
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
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>Description</label>
            <textarea 
              rows="4"
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
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
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
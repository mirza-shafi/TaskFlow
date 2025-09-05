import React, { useState, useEffect } from 'react';

// THE FIX IS ON THIS LINE: We are renaming the 'taskToEdit' prop to 'task' for use inside this component.
export default function EditTaskModal({ taskToEdit: task, isOpen, onClose, onUpdateTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  // This effect runs when the 'task' prop changes
  // It populates the form with the existing task's data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      // Format the date correctly for the input[type=date]
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Now, 'task' is correctly defined and the app will not crash
    onUpdateTask(task._id, { title, description, priority, dueDate });
    onClose(); // Close modal after submitting
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
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
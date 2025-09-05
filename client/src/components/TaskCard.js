import React from 'react';

// Icons
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

// Map to convert priority to a color
const priorityColors = {
  high: '#ef4444', // Red
  medium: '#f59e0b', // Amber
  low: '#22c55e', // Green
};

export default function TaskCard({ task, onEdit, onDelete }) {
  // Helper function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    // The main card is a flex container, with the priority border on the left
    <div className="task-card" style={{ borderLeftColor: priorityColors[task.priority] }}>
      
      {/* This container holds all the text content and grows to fill space */}
      <div className="task-card-content">
        <p className="task-title">{task.title}</p>
        
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-details">
          {task.dueDate && (
            <span className="due-date">
              🗓️ {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* This separate container holds the action buttons */}
      <div className="task-card-actions">
        <button onClick={() => onEdit(task)} className="action-btn" title="Edit Task">
          <EditIcon />
        </button>
        <button onClick={() => onDelete(task._id)} className="action-btn delete-btn" title="Delete Task">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
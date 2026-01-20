import React from 'react';
import { Task, TaskPriority } from '../types/task.types';
import { FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  // Helper function to format the date
  const formatDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { day: 'numeric' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${month} ${day}`;
  };

  const getPriorityClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'pill-urgent'; // 'Urgent' in image is blue/bright
      case 'medium': return 'pill-design'; // 'Design' in image is purple
      default: return 'pill-normal';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Design'; // Mapping medium to 'Design' style for demo
      default: return 'Normal';
    }
  };

  return (
    <div className="task-card-v2">
      <div className="task-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className={`priority-pill ${getPriorityClass(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
        <div className="task-card-actions-v2">
           <button onClick={() => onEdit(task)} className="card-btn" title="Edit"><FiEdit2 /></button>
           <button onClick={() => onDelete(task._id)} className="card-btn delete" title="Delete"><FiTrash2 /></button>
        </div>
      </div>

      <h4 className="task-card-title">{task.title}</h4>
      
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-meta-left">
          {task.dueDate && (
            <span className="task-date">
              <FiClock /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        
        {/* Mock Avatar for visual fidelity with reference */}
        <div className="task-avatar">
           {task.title.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

import React from 'react';
import { Task, TaskPriority } from '../types/task.types';
import { FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';

// Map to convert priority to a color
const priorityColors: { [key in TaskPriority]: string } = {
  high: '#ef4444', // Red
  medium: '#f59e0b', // Amber
  low: '#22c55e', // Green
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  // Helper function to format the date
  const formatDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="task-card-v2" style={{ borderLeftColor: priorityColors[task.priority] }}>
      <div className="task-card-body">
        <h4 className="task-card-title">{task.title}</h4>
        
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}

        <div className="task-card-footer">
          {task.dueDate && (
            <span className="task-date-tag">
              <FiClock /> {formatDate(task.dueDate)}
            </span>
          )}
          
          <div className="task-card-actions-v2">
            <button onClick={() => onEdit(task)} className="card-btn" title="Edit">
              <FiEdit2 />
            </button>
            <button onClick={() => onDelete(task._id)} className="card-btn delete" title="Delete">
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

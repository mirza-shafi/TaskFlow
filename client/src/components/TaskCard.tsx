import React from 'react';
import { Task, TaskPriority } from '../types/task.types';
import { FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';
import { formatDisplayDateTime } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { timezone, timeFormat } = useSettings();


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
              <FiClock /> {formatDisplayDateTime(task.dueDate, timezone, timeFormat)}
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

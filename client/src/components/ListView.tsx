import React from 'react';
import { Task } from '../types/task.types';
import { FiClock, FiCheckCircle, FiCircle, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Priority Colors
const priorityMap: { [key: string]: string } = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

interface ListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (task: Task) => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, onEdit, onDelete, onToggleStatus }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="list-view-container">
      <AnimatePresence>
        {tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state"
          >
            No tasks found. Start adding some!
          </motion.div>
        ) : (
          <div className="task-list">
            {tasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`list-item ${task.status === 'done' ? 'completed' : ''}`}
              >
                <div className="list-item-left">
                  <button 
                    className={`status-toggle ${task.status}`}
                    onClick={() => onToggleStatus(task)}
                  >
                    {task.status === 'done' ? <FiCheckCircle /> : <FiCircle />}
                  </button>
                  <div 
                    className="priority-indicator" 
                    style={{ backgroundColor: priorityMap[task.priority] }}
                  />
                  <div className="task-info">
                    <span className="task-title-text">{task.title}</span>
                    {task.description && (
                      <span className="task-desc-text">{task.description}</span>
                    )}
                  </div>
                </div>

                <div className="list-item-right">
                  {task.dueDate && (
                    <span className="date-tag">
                      <FiClock /> {formatDate(task.dueDate)}
                    </span>
                  )}
                  
                  <div className="list-actions">
                    <button onClick={() => onEdit(task)} className="icon-btn edit">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => onDelete(task._id)} className="icon-btn delete">
                      <FiTrash2 />
                    </button>
                    <button className="icon-btn more">
                      <FiMoreVertical />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .list-view-container {
          padding: 1rem 0;
          max-width: 900px;
          margin: 0 auto;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background-color: var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          background: white;
          transition: background 0.2s;
          color: var(--text-dark);
        }

        .list-item:hover {
          background: #f8fafc;
        }

        .list-item.completed .task-title-text {
          text-decoration: line-through;
          color: var(--text-light);
        }

        .list-item-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-grow: 1;
        }

        .status-toggle {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 1.25rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .status-toggle.done {
          color: #10b981;
        }

        .status-toggle:hover {
          color: var(--primary-blue);
        }

        .priority-indicator {
          width: 4px;
          height: 16px;
          border-radius: 2px;
        }

        .task-info {
          display: flex;
          flex-direction: column;
        }

        .task-title-text {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .task-desc-text {
          font-size: 0.8rem;
          color: var(--text-light);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 400px;
        }

        .list-item-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .date-tag {
          font-size: 0.75rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }

        .list-actions {
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .list-item:hover .list-actions {
          opacity: 1;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-size: 1rem;
          padding: 5px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #f1f5f9;
          color: var(--text-dark);
        }

        .icon-btn.delete:hover {
          color: #ef4444;
          background: #fef2f2;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-light);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ListView;

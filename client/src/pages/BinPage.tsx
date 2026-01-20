import React, { useEffect, useState } from 'react';
import * as taskApi from '../api/task.api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types/task.types';
import { FiTrash2, FiRefreshCcw, FiX } from 'react-icons/fi';
import './BinPage.css';

const BinPage: React.FC = () => {
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTrashedTasks() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await taskApi.getTrashedTasks();
        setDeletedTasks(data);
      } catch (error) {
        console.error('Failed to load trashed tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTrashedTasks();
  }, [user]);

  const handleRestore = async (taskId: string) => {
    try {
      await taskApi.restoreTask(taskId);
      setDeletedTasks(deletedTasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      try {
        await taskApi.permanentlyDeleteTask(taskId);
        setDeletedTasks(deletedTasks.filter(t => t._id !== taskId));
      } catch (error) {
        console.error('Failed to delete task permanently:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bin-page loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bin-page">
      <header className="bin-header">
        <div className="bin-header-content">
          <div>
            <h1>Bin</h1>
            <p className="bin-subtitle">Manage your deleted tasks</p>
          </div>
          <button className="close-btn" onClick={() => navigate('/todo')}>
            <FiX />
          </button>
        </div>
      </header>

      <div className="bin-content">
        {deletedTasks.length === 0 ? (
          <div className="empty-bin">
            <FiTrash2 size={48} />
            <p>Your bin is empty</p>
          </div>
        ) : (
          <div className="deleted-tasks-list">
            {deletedTasks.map(task => (
              <div key={task._id} className="deleted-task-item">
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <span className="deleted-date">
                    Deleted: {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="task-actions">
                  <button 
                    className="btn-restore" 
                    onClick={() => handleRestore(task._id)}
                    title="Restore Task"
                  >
                    <FiRefreshCcw /> Restore
                  </button>
                  <button 
                    className="btn-delete-permanent" 
                    onClick={() => handlePermanentDelete(task._id)}
                    title="Delete Forever"
                  >
                    <FiX /> Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BinPage;

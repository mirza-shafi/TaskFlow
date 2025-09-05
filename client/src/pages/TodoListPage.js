import React, { useEffect, useState, useMemo } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import ProfileMenu from '../components/ProfileMenu';
import ConfirmationModal from '../components/ConfirmationModal';

export default function TodoListPage() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({
    todo: { name: 'To Do', items: [] },
    doing: { name: 'In Progress', items: [] },
    done: { name: 'Done', items: [] },
  });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [activeTab, setActiveTab] = useState('todo');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTasks() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user, logout, navigate]);

  const sortedTasks = useMemo(() => {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [tasks, sortBy]);

  useEffect(() => {
    const newColumns = {
      todo: { name: 'To Do', items: [] },
      doing: { name: 'In Progress', items: [] },
      done: { name: 'Done', items: [] },
    };
    sortedTasks.forEach(task => {
      if (newColumns[task.status]) {
        newColumns[task.status].items.push(task);
      }
    });
    setColumns(newColumns);
  }, [sortedTasks]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const newColumns = { ...columns };
    const sourceColumn = newColumns[source.droppableId];
    const destColumn = newColumns[destination.droppableId];
    const [removed] = sourceColumn.items.splice(source.index, 1);
    destColumn.items.splice(destination.index, 0, removed);
    setColumns(newColumns);
    updateTask(draggableId, { status: destination.droppableId }).catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
    window.location.reload();
  };

  const handleAddTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await updateTask(taskId, taskData);
      setTasks(tasks.map(task => (task._id === taskId ? updatedTask : task)));
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteRequest = (taskId) => {
    setTaskToDelete(taskId);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setTasks(tasks.filter(task => task._id !== taskToDelete));
        setTaskToDelete(null);
      } catch (error) {
        console.error("Failed to delete task:", error);
        setTaskToDelete(null);
      }
    }
  };

  return (
    <div className="page-container-kanban" data-active-tab={activeTab}>
      <header className="header-kanban">
        <h1>TaskFlow</h1>
        <div className="header-actions">
          <div className="sort-container">
            <label htmlFor="sort-by">Sort by:</label>
            <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="createdAt">Creation Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="button-add-task">
            + New Task
          </button>
          <ProfileMenu onLogout={handleLogout} />
        </div>
      </header>
      
      {loading ? <p>Loading board...</p> : (
        <>
          <div className="kanban-board-container">
            <KanbanBoard 
              columns={columns} 
              onDragEnd={handleDragEnd} 
              onEdit={handleEdit} 
              onDelete={handleDeleteRequest}
            />
          </div>

          <div className="mobile-tab-bar">
            <button className={`tab-button ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>To Do</button>
            <button className={`tab-button ${activeTab === 'doing' ? 'active' : ''}`} onClick={() => setActiveTab('doing')}>In Progress</button>
            <button className={`tab-button ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>Done</button>
          </div>
        </>
      )}

      {/* Your Modals go here */}
      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddTask={handleAddTask} />
      <EditTaskModal isOpen={!!editingTask} onClose={() => setEditingTask(null)} taskToEdit={editingTask} onUpdateTask={handleUpdateTask} />
      <ConfirmationModal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={confirmDelete} title="Delete Task" message="Are you sure you want to permanently delete this task? This action cannot be undone." />
    </div>
  );
}
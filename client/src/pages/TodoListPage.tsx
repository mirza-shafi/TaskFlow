import React, { useEffect, useState, useMemo } from 'react';
import * as taskApi from '../api/task.api';
import * as folderApi from '../api/folder.api';
import * as teamApi from '../api/team.api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import ListView from '../components/ListView';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import ProfileMenu from '../components/ProfileMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';
import { DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiInbox, FiCalendar, FiStar, FiPlus, FiFilter, FiLogOut } from 'react-icons/fi';
import './TodoListPage.css';

interface Column {
  name: string;
  items: Task[];
}

interface Columns {
  [key: string]: Column;
}

type SortBy = 'createdAt' | 'dueDate' | 'priority';
type ViewFilter = 'all' | 'today' | 'upcoming';
type WorkspaceView = 'list' | 'kanban';

const TodoListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Columns>({
    todo: { name: 'To Do', items: [] },
    doing: { name: 'In Progress', items: [] },
    done: { name: 'Done', items: [] },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('list');
  const [folders, setFolders] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTasks() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await taskApi.getTasks();
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

  useEffect(() => {
    async function loadWorkspaceData() {
      if (!user) return;
      try {
        const [folderData, teamData] = await Promise.all([
          folderApi.getFolders(),
          teamApi.getTeams()
        ]);
        setFolders(folderData);
        setTeams(teamData);
      } catch (error) {
        console.error("Failed to load folders/teams:", error);
      }
    }
    loadWorkspaceData();
  }, [user]);

  const confirmDelete = async (): Promise<void> => {
    if (taskToDelete) {
      try {
        await taskApi.deleteTask(taskToDelete);
        setTasks(tasks.filter(task => task._id !== taskToDelete));
        setTaskToDelete(null);
      } catch (error) {
        console.error("Failed to delete task:", error);
        setTaskToDelete(null);
      }
    }
  };

  const filteredTasks = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (viewFilter === 'all') return true;
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      if (viewFilter === 'today') {
        return taskDate.getTime() === now.getTime();
      }
      if (viewFilter === 'upcoming') {
        return taskDate.getTime() > now.getTime();
      }
      return true;
    });
  }, [tasks, viewFilter]);

  const sortedTasks = useMemo(() => {
    const priorityValues: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [filteredTasks, sortBy]);

  useEffect(() => {
    const newColumns: Columns = {
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

  const handleDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const newColumns = { ...columns };
    const sourceColumn = newColumns[source.droppableId];
    const destColumn = newColumns[destination.droppableId];
    const [removed] = sourceColumn.items.splice(source.index, 1);
    destColumn.items.splice(destination.index, 0, removed);
    setColumns(newColumns);
    taskApi.updateTask(draggableId, { status: destination.droppableId as TaskStatus }).catch(console.error);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('userToken');
    navigate('/');
    window.location.reload();
  };

  const handleAddTask = async (taskData: CreateTaskPayload): Promise<void> => {
    try {
      const newTask = await taskApi.createTask(taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleEdit = (task: Task): void => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (taskId: string, taskData: UpdateTaskPayload): Promise<void> => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, taskData);
      setTasks(tasks.map(task => (task._id === taskId ? updatedTask : task)));
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteRequest = (taskId: string): void => {
    setTaskToDelete(taskId);
  };

  const handleToggleStatus = async (task: Task): Promise<void> => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const updatedTask = await taskApi.updateTask(task._id, { status: newStatus });
      setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to toggle task status:", error);
    }
  };

  return (
    <div className="workspace-layout">
      {/* Sidebar Navigation */}
      <motion.aside 
        className="sidebar"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="sidebar-logo">
          <FiCheckSquare />
          <span>TaskFlow</span>
        </div>
        
        <div className="sidebar-nav">
          <div 
            className={`nav-item ${viewFilter === 'all' ? 'active' : ''}`}
            onClick={() => setViewFilter('all')}
          >
            <span className="nav-item-icon"><FiInbox /></span>
            <span className="nav-item-text">All Tasks</span>
          </div>
          <div 
            className={`nav-item ${viewFilter === 'today' ? 'active' : ''}`}
            onClick={() => setViewFilter('today')}
          >
            <span className="nav-item-icon"><FiStar /></span>
            <span className="nav-item-text">Today</span>
          </div>
          <div 
            className={`nav-item ${viewFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setViewFilter('upcoming')}
          >
            <span className="nav-item-icon"><FiCalendar /></span>
            <span className="nav-item-text">Upcoming</span>
          </div>
        </div>

        <div className="sidebar-divider" />
        
        <div className="sidebar-section-title">Folders</div>
        <div className="sidebar-nav">
          {folders.map(folder => (
            <div key={folder._id} className="nav-item">
              <span className="nav-item-icon" style={{ color: folder.color || 'var(--primary-blue)' }}>
                <FiStar />
              </span>
              <span className="nav-item-text">{folder.name}</span>
            </div>
          ))}
          <div className="nav-item" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            <span className="nav-item-icon"><FiPlus /></span>
            <span className="nav-item-text">Add Folder</span>
          </div>
        </div>

        <div className="sidebar-divider" />
        
        <div className="sidebar-section-title">Teams</div>
        <div className="sidebar-nav">
          {teams.map(team => (
            <div key={team._id} className="nav-item">
              <span className="nav-item-icon"><FiInbox /></span>
              <span className="nav-item-text">{team.name}</span>
            </div>
          ))}
          <div className="nav-item" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            <span className="nav-item-icon"><FiPlus /></span>
            <span className="nav-item-text">Create Team</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }} className="sidebar-nav">
           <div className="nav-item" onClick={handleLogout}>
            <span className="nav-item-icon"><FiLogOut /></span>
            <span className="nav-item-text">Sign Out</span>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <motion.main 
        className="main-workspace"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="workspace-header">
          <div className="view-title">
            {viewFilter === 'all' && 'All Tasks'}
            {viewFilter === 'today' && 'Today'}
            {viewFilter === 'upcoming' && 'Upcoming'}
          </div>
          
          <div className="header-tools">
            <div className="sort-container" style={{ color: 'var(--text-dark)' }}>
              <div className="view-switcher" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px', marginRight: '1rem' }}>
                <button 
                  onClick={() => setWorkspaceView('list')}
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    background: workspaceView === 'list' ? 'white' : 'transparent',
                    boxShadow: workspaceView === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >List</button>
                <button 
                  onClick={() => setWorkspaceView('kanban')}
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    background: workspaceView === 'kanban' ? 'white' : 'transparent',
                    boxShadow: workspaceView === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >Kanban</button>
              </div>
              <FiFilter style={{ color: 'var(--text-light)' }} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="sort-select"
                style={{ background: 'transparent', color: 'var(--text-dark)', border: 'none', fontWeight: 'bold' }}
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            <button onClick={() => setIsAddModalOpen(true)} className="btn-signup" style={{ padding: '0.5rem 1rem' }}>
              <FiPlus /> New Task
            </button>
            
            <ProfileMenu onLogout={handleLogout} />
          </div>
        </header>

        <div className="board-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : (
            workspaceView === 'kanban' ? (
              <KanbanBoard 
                columns={columns} 
                onDragEnd={handleDragEnd} 
                onEdit={handleEdit} 
                onDelete={handleDeleteRequest}
              />
            ) : (
              <ListView 
                tasks={sortedTasks}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onToggleStatus={handleToggleStatus}
              />
            )
          )}
        </div>
      </motion.main>

      {/* Modals */}
      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddTask={handleAddTask} 
        folders={folders}
        teams={teams}
      />
      <EditTaskModal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        taskToEdit={editingTask} 
        onUpdateTask={handleUpdateTask} 
        folders={folders}
        teams={teams}
      />
      <ConfirmationModal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={confirmDelete} title="Delete Task" message="Are you sure you want to permanently delete this task? This action cannot be undone." />
    </div>
  );
};

export default TodoListPage;

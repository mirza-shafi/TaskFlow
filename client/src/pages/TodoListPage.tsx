import React, { useEffect, useState, useMemo } from 'react';
import * as taskApi from '../api/task.api';
import * as folderApi from '../api/folder.api';
import * as teamApi from '../api/team.api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { 
  isSameDayInTimezone, 
  isOverdueInTimezone, 
  isUpcomingInTimezone,
  formatDisplayDateTime
} from '../utils/dateUtils';
import KanbanBoard from '../components/KanbanBoard';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import AddFolderModal from '../components/AddFolderModal';
import AddTeamModal from '../components/AddTeamModal';
import ProfileMenu from '../components/ProfileMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';
import { Folder } from '../types/folder.types';
import { Team } from '../types/team.types';
import { motion } from 'framer-motion';
import { 
  FiCheckSquare, FiInbox, FiCalendar, FiStar, FiPlus, 
  FiList, FiGrid, FiFolder, FiUsers, FiSettings, FiCheckCircle, FiTrash2
} from 'react-icons/fi';
import './TodoListPage.css';

type ViewFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
type WorkspaceView = 'list' | 'kanban';

const TodoListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState({
    todo: { name: 'To Do', items: [] as Task[] },
    doing: { name: 'In Progress', items: [] as Task[] },
    review: { name: 'Review', items: [] as Task[] },
    done: { name: 'Done', items: [] as Task[] },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState<boolean>(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('list');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const { logout, user } = useAuth();
  const { appDate, timezone, timeFormat } = useSettings();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes or width changes (optional optimization)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [navigate]);

  // Load tasks
  useEffect(() => {
    async function loadTasks() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await taskApi.getTasks();
        setTasks(data);
        // Organize tasks into columns
        const todoItems = data.filter(t => t.status === 'todo');
        const doingItems = data.filter(t => t.status === 'doing');
        const reviewItems = data.filter(t => t.status === 'review');
        const doneItems = data.filter(t => t.status === 'done');
        setColumns({
          todo: { name: 'To Do', items: todoItems },
          doing: { name: 'In Progress', items: doingItems },
          review: { name: 'Review', items: reviewItems },
          done: { name: 'Done', items: doneItems },
        });
      } catch (error: any) {
        if (error?.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          console.error('Failed to load tasks:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user, logout, navigate]);

  // Helper function to check if task is overdue
  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.status === 'done') return false;
    return isOverdueInTimezone(task.dueDate, appDate, timezone);
  };

  // Helper function to check if task is today
  const isToday = (task: Task): boolean => {
    if (!task.dueDate) return false;
    return isSameDayInTimezone(task.dueDate, appDate, timezone);
  };

  // Organize tasks into sections
  const organizedTasks = useMemo(() => {
    const overdue = tasks.filter(t => isOverdue(t) && t.status !== 'done');
    const today = tasks.filter(t => isToday(t) && t.status !== 'done' && !isOverdue(t));
    const upcoming = tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      return isUpcomingInTimezone(t.dueDate, appDate, timezone);
    });
    const noDate = tasks.filter(t => !t.dueDate && t.status !== 'done');
    const completed = tasks.filter(t => t.status === 'done');

    return { overdue, today, upcoming, noDate, completed };
  }, [tasks]);

  // Task CRUD operations
  const handleAddTask = async (taskData: CreateTaskPayload): Promise<void> => {
    try {
      const newTask = await taskApi.createTask(taskData);
      setTasks([...tasks, newTask]);
      // Update columns
      const newColumns = { ...columns };  
      newColumns[newTask.status].items.push(newTask);
      setColumns(newColumns);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: UpdateTaskPayload): Promise<void> => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, taskData);
      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
      // Update columns
      const updatedTasks = tasks.map(t => t._id === taskId ? updatedTask : t);
      const todoItems = updatedTasks.filter(t => t.status === 'todo');
      const doingItems = updatedTasks.filter(t => t.status === 'doing');
      const reviewItems = updatedTasks.filter(t => t.status === 'review');
      const doneItems = updatedTasks.filter(t => t.status === 'done');
      setColumns({
        todo: { name: 'To Do', items: todoItems },
        doing: { name: 'In Progress', items: doingItems },
        review: { name: 'Review', items: reviewItems },
        done: { name: 'Done', items: doneItems },
      });
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (taskToDelete) {
      try {
        await taskApi.deleteTask(taskToDelete);
        setTasks(tasks.filter(task => task._id !== taskToDelete));
        setTaskToDelete(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const toggleTaskStatus = async (task: Task): Promise<void> => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await handleUpdateTask(task._id, { status: newStatus });
  };

  // Handle drag and drop for Kanban
  const handleDragEnd = async (result: any): Promise<void> => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = columns[source.droppableId as keyof typeof columns];
    const destColumn = columns[destination.droppableId as keyof typeof columns];

    if (source.droppableId === destination.droppableId) {
      const copiedItems = [...sourceColumn.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: copiedItems }
      });
    } else {
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });

      // Update task status in backend
      await handleUpdateTask(removed._id, { status: destination.droppableId as any });
    }
  };

  // Folder operations
  const handleAddFolder = async (folderName: string, color: string): Promise<void> => {
    try {
      const newFolder = await folderApi.createFolder({ name: folderName, color, isPrivate: true });
      setFolders([...folders, newFolder]);
      setIsAddFolderModalOpen(false);
    } catch (error) {
      console.error('Failed to add folder:', error);
    }
  };

  // Team operations
  const handleCreateTeam = async (teamName: string): Promise<void> => {
    try {
      const newTeam = await teamApi.createTeam({ name: teamName });
      setTeams([...teams, newTeam]);
      setIsAddTeamModalOpen(false);
    } catch (error) {
      console.error('Failed to add team:', error);
    }
  };

  // Render task sections
  const renderTaskSection = (title: string, tasks: Task[], icon?: React.ReactNode) => {
    if (tasks.length === 0) return null;

    return (
      <div className="list-section">
        <div className="section-header">
          {icon}
          <span className="section-title">{title}</span>
          <span className="task-count">{tasks.length}</span>
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              className={`task-item ${task.status === 'done' ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setEditingTask(task)}
            >
              <div
                className="task-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskStatus(task);
                }}
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                {(task.dueDate || task.priority) && (
                  <div className="task-meta">
                    {task.dueDate && (
                      <span>
                        <FiCalendar size={12} />
                        {formatDisplayDateTime(task.dueDate, timezone, timeFormat)}
                      </span>
                    )}
                    {task.priority && task.priority !== 'low' && (
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="task-actions-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                 {/* Member Icon */}
                 <div className="task-member-circle" style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    background: '#e2e8f0', color: '#64748b', fontSize: '10px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600'
                 }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                 </div>

                 <button 
                    className="btn-delete-task"
                    onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task._id);
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                 >
                    <FiTrash2 size={15} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="workspace-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <FiCheckSquare />
          <span>TaskFlow</span>
        </div>
        {/* ... keeping sidebar nav content same ... */}
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${viewFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setViewFilter('all'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiInbox /></span>
            <span className="nav-item-text">All</span>
          </div>
          <div
            className={`nav-item ${viewFilter === 'today' ? 'active' : ''}`}
            onClick={() => { setViewFilter('today'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiCalendar /></span>
            <span className="nav-item-text">Today</span>
          </div>
          <div
            className={`nav-item ${viewFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => { setViewFilter('upcoming'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiStar /></span>
            <span className="nav-item-text">Upcoming</span>
          </div>
          <div
            className={`nav-item ${viewFilter === 'completed' ? 'active' : ''}`}
            onClick={() => { setViewFilter('completed'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiCheckCircle /></span>
            <span className="nav-item-text">Completed</span>
          </div>
        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section-title">Lists</div>
        <nav className="sidebar-nav">
          {folders.map((folder) => (
            <div key={folder._id} className="nav-item">
              <span className="nav-item-icon"><FiFolder /></span>
              <span className="nav-item-text">{folder.name}</span>
            </div>
          ))}
          <div className="nav-item" style={{ fontSize: '0.85rem', opacity: 0.7 }} onClick={() => setIsAddFolderModalOpen(true)}>
            <span className="nav-item-icon"><FiPlus /></span>
            <span className="nav-item-text">Add Folder</span>
          </div>
        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section-title">Teams</div>
        <nav className="sidebar-nav">
          {teams.map((team) => (
            <div key={team._id} className="nav-item">
              <span className="nav-item-icon"><FiUsers /></span>
              <span className="nav-item-text">{team.name}</span>
            </div>
          ))}
          <div className="nav-item" style={{ fontSize: '0.85rem', opacity: 0.7 }} onClick={() => setIsAddTeamModalOpen(true)}>
            <span className="nav-item-icon"><FiPlus /></span>
            <span className="nav-item-text">Create Team</span>
          </div>
        </nav>

        <div style={{ flex: 1 }}></div>
        
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <span className="nav-item-icon"><FiSettings /></span>
            <span className="nav-item-text">Settings</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/bin')}>
             <span className="nav-item-icon"><FiTrash2 /></span>
             <span className="nav-item-text">Bin</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-workspace">
        <header className="workspace-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FiList size={24} />
          </button>

          <h1 className="view-title">
            {viewFilter === 'all' && 'All Tasks'}
            {viewFilter === 'today' && 'Today'}
            {viewFilter === 'upcoming' && 'Upcoming'}
            {viewFilter === 'completed' && 'Completed'}
          </h1>
          {/* ... existing header tools ... */}

          <div className="header-tools">
            {/* Debug/Active Date Display can go here if needed, but it's in Settings */}
            <div className="view-switcher">
              <button
                className={workspaceView === 'list' ? 'active' : ''}
                onClick={() => setWorkspaceView('list')}
              >
                <FiList /> List
              </button>
              <button
                className={workspaceView === 'kanban' ? 'active' : ''}
                onClick={() => setWorkspaceView('kanban')}
              >
                <FiGrid /> Board
              </button>
            </div>

            <button className="btn-signup" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus /> Add Task
            </button>

            <ProfileMenu onLogout={logout} />
          </div>
        </header>

        <div className="board-wrapper">
          {workspaceView === 'list' ? (
            <div className="list-view">
              {viewFilter === 'all' && (
                <>
                  {renderTaskSection('Overdue', organizedTasks.overdue)}
                  {renderTaskSection('Today', organizedTasks.today)}
                  {renderTaskSection('Upcoming', organizedTasks.upcoming)}
                  {renderTaskSection('No Date', organizedTasks.noDate)}
                  {renderTaskSection('Completed', organizedTasks.completed)}
                </>
              )}
              {viewFilter === 'today' && renderTaskSection('Today', organizedTasks.today)}
              {viewFilter === 'upcoming' && renderTaskSection('Upcoming', organizedTasks.upcoming)}
              {viewFilter === 'completed' && renderTaskSection('Completed', organizedTasks.completed)}
              
              {tasks.length === 0 && (
                <div className="empty-state">
                  <FiCheckSquare />
                  <p>No tasks yet. Create your first task!</p>
                </div>
              )}
            </div>
          ) : (
            <KanbanBoard
              columns={columns}
              onDragEnd={handleDragEnd}
              onEdit={setEditingTask}
              onDelete={(taskId) => setTaskToDelete(taskId)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
        folders={folders}
        teams={teams}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={true}
          taskToEdit={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
          folders={folders}
          teams={teams}
        />
      )}

      {taskToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={confirmDelete}
          onClose={() => setTaskToDelete(null)}
        />
      )}

      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onAddFolder={handleAddFolder}
      />

      <AddTeamModal
        isOpen={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
};

export default TodoListPage;

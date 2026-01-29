import { useState, useMemo, useEffect } from 'react';
import { Check } from 'lucide-react';
import { 
  FiCheckSquare, FiCalendar, FiStar, FiPlus, 
  FiList, FiFolder, FiUsers, FiSettings, FiCheckCircle, FiTrash2, FiSidebar, FiEdit2
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as folderApi from '../api/folder.api';
import * as teamApi from '../api/team.api';
import { Folder } from '../types/folder.types';
import { Team } from '../types/team.types';
import ProfileMenu from '../components/ProfileMenu';
import AddFolderModal from '../components/AddFolderModal';
import AddTeamModal from '../components/AddTeamModal';
import './TodoListPage.css';
import './HabitTrackerPage.css';

const HabitTrackerPage = () => {
  const [currentMonth] = useState('JANUARY');
  const [routines, setRoutines] = useState([
    { name: 'Wake at 06:00', emoji: '⏰', data: Array(31).fill(false) },
    { name: 'Cold Shower', emoji: '🚿', data: Array(31).fill(false) },
    { name: 'Meditation', emoji: '🧘', data: Array(31).fill(false) },
    { name: 'Daily Structuring', emoji: '📝', data: Array(31).fill(false) },
    { name: 'Deep Focus Work', emoji: '💼', data: Array(31).fill(false) },
    { name: 'Money Management', emoji: '💰', data: Array(31).fill(false) },
    { name: 'Alcohol Free', emoji: '🚫', data: Array(31).fill(false) },
    { name: 'Digital Detox', emoji: '📱', data: Array(31).fill(false) },
    { name: 'Mindful Journal', emoji: '📔', data: Array(31).fill(false) },
    { name: 'Reading', emoji: '📚', data: Array(31).fill(false) },
  ]);

  // Sidebar & Layout State
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);

  const daysInMonth = 31;
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Load Sidebar Data
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [foldersData, teamsData] = await Promise.all([
          folderApi.getFolders(),
          teamApi.getTeams()
        ]);
        setFolders(foldersData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load sidebar data:', error);
      }
    }
    loadData();
  }, [user]);

  // Folder/Team Handlers
   const handleAddFolder = async (folderName: string, color: string): Promise<void> => {
    try {
      const newFolder = await folderApi.createFolder({ name: folderName, color, isPrivate: true });
      setFolders([...folders, newFolder]);
      setIsAddFolderModalOpen(false);
    } catch (error) {
      console.error('Failed to add folder:', error);
    }
  };

  const handleCreateTeam = async (teamName: string): Promise<void> => {
    try {
      const newTeam = await teamApi.createTeam({ name: teamName });
      setTeams([...teams, newTeam]);
      setIsAddTeamModalOpen(false);
    } catch (error) {
      console.error('Failed to add team:', error);
    }
  };


  const toggleDay = (routineIndex: number, dayIndex: number) => {
    const newRoutines = [...routines];
    newRoutines[routineIndex].data[dayIndex] = !newRoutines[routineIndex].data[dayIndex];
    setRoutines(newRoutines);
  };

  const stats = useMemo(() => {
    const totalRoutines = routines.length * daysInMonth;
    const completedRoutines = routines.reduce((sum, routine) => 
      sum + routine.data.filter(d => d).length, 0
    );
    const progressPercent = totalRoutines > 0 ? ((completedRoutines / totalRoutines) * 100).toFixed(1) : '0.0';
    
    return { totalRoutines, completedRoutines, progressPercent };
  }, [routines]);

  const dailyProgress = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, day) => {
      const completed = routines.filter(r => r.data[day]).length;
      const total = routines.length;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    });
  }, [routines]);

  const dailyNotDone = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, day) => {
      return routines.filter(r => !r.data[day]).length;
    });
  }, [routines]);

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
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FiCheckSquare />
            {!isSidebarCollapsed && <span>TaskFlow</span>}
          </div>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FiSidebar />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div
            className="nav-item"
            onClick={() => { navigate('/app'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiList /></span>
            <span className="nav-item-text">All</span>
          </div>
          <div
            className="nav-item"
            onClick={() => { navigate('/note'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiEdit2 /></span>
            <span className="nav-item-text">Note</span>
          </div>
          <div
            className="nav-item"
            onClick={() => { navigate('/todo'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiCalendar /></span>
            <span className="nav-item-text">Today</span>
          </div>
          <div
            className="nav-item"
            onClick={() => { navigate('/app'); setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiStar /></span>
            <span className="nav-item-text">Upcoming</span>
          </div>
           <div
            className="nav-item active"
            onClick={() => { setIsSidebarOpen(false); }}
          >
            <span className="nav-item-icon"><FiCheckCircle /></span>
            <span className="nav-item-text">Habits</span>
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
        
        <div>
          <div className="sidebar-bottom-btn" onClick={() => { navigate('/app'); setIsSidebarOpen(false); }}>
            <span className="nav-item-icon"><FiCheckCircle /></span>
            <span className="nav-item-text">Completed</span>
          </div>
          <div className="sidebar-bottom-btn" onClick={() => navigate('/settings')}>
            <span className="nav-item-icon"><FiSettings /></span>
            <span className="nav-item-text">Settings</span>
          </div>
          <div className="sidebar-bottom-btn" onClick={() => navigate('/bin')}>
             <span className="nav-item-icon"><FiTrash2 /></span>
             <span className="nav-item-text">Bin</span>
          </div>
        </div>
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
          
          <h1 className="view-title">Habit Tracker</h1>

          <div className="header-tools">
            <ProfileMenu onLogout={logout} />
          </div>
        </header>

        <div className="board-wrapper">
          <div className="habit-tracker-container">
            {/* Header */}
            <div className="habit-header">
              <h1 className="habit-month-title">{currentMonth}</h1>
              <div className="habit-stats">
                <div className="stat-item">
                  <div className="stat-label">Number of Routines</div>
                  <div className="stat-value">{routines.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Completed Routines</div>
                  <div className="stat-value">{stats.completedRoutines}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Progress</div>
                  <div className="stat-progress-container">
                    <div className="progress-bar-wrapper">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${stats.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Progress in %</div>
                  <div className="stat-percentage">{stats.progressPercent}%</div>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="habit-calendar">
              <div className="calendar-grid">
                <div className="calendar-header-row">
                  <div className="routine-label">My Routine</div>
                  {weeks.map((week) => (
                    <div key={week} className="week-label">
                      {week}
                    </div>
                  ))}
                </div>

                {/* Days of week header */}
                <div className="calendar-days-header">
                  <div className="day-header-spacer"></div>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <div key={i} className="day-header">
                      {daysOfWeek[i % 7]}
                    </div>
                  ))}
                </div>

                {/* Date numbers */}
                <div className="calendar-date-row">
                  <div className="day-header-spacer"></div>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <div key={i} className="date-number">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Routines */}
                {routines.map((routine, routineIdx) => (
                  <div key={routineIdx} className="routine-row">
                    <div className="routine-name">
                      <span className="routine-emoji">{routine.emoji}</span>
                      {routine.name}
                    </div>
                    {routine.data.map((completed, dayIdx) => (
                      <button
                        key={dayIdx}
                        onClick={() => toggleDay(routineIdx, dayIdx)}
                        className={`habit-checkbox ${completed ? 'checked' : ''}`}
                      >
                        {completed && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Progress Row */}
                <div className="summary-row">
                  <div className="summary-label">Progress</div>
                  {dailyProgress.map((progress, idx) => (
                    <div key={idx} className="summary-value">
                      {progress}%
                    </div>
                  ))}
                </div>

                {/* Not Done Row */}
                <div className="summary-row">
                  <div className="summary-label">Not Done</div>
                  {dailyNotDone.map((notDone, idx) => (
                    <div 
                      key={idx} 
                      className={`summary-value not-done ${notDone === 0 ? 'zero' : ''}`}
                    >
                      {notDone}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="habit-chart-container">
              <div className="chart-title">Monthly Progress Trend</div>
              <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={`M 0 ${100 - dailyProgress[0]} ` + dailyProgress.map((value, idx) => {
                    const x = (idx / (daysInMonth - 1)) * 100;
                    const y = 100 - value;
                    return `L ${x} ${y}`;
                  }).join(' ')}
                  className="chart-line"
                />
                <path
                  d={`M 0 100 L 0 ${100 - dailyProgress[0]} ` + dailyProgress.map((value, idx) => {
                    const x = (idx / (daysInMonth - 1)) * 100;
                    const y = 100 - value;
                    return `L ${x} ${y}`;
                  }).join(' ') + ` L 100 100 Z`}
                  className="chart-area"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>

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

export default HabitTrackerPage;

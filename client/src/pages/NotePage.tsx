import React, { useEffect, useState } from 'react';
import * as folderApi from '../api/folder.api';
import * as taskApi from '../api/task.api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddFolderModal from '../components/AddFolderModal';
import ProfileMenu from '../components/ProfileMenu';
import { Folder } from '../types/folder.types';
import { Task } from '../types/task.types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  FiCheckSquare, FiCalendar, FiStar, FiPlus, 
  FiList, FiFolder, FiTrash2, FiSidebar, FiCheckCircle, FiSettings, FiEdit2, FiMoreVertical
} from 'react-icons/fi';
import { 
  MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatColorText, MdFormatColorFill,
  MdInsertLink, MdInsertPhoto, MdFormatListBulleted, MdFormatListNumbered,
  MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify,
  MdCheckBox, MdUndo, MdRedo, MdPrint, MdRemove, MdAdd, MdComment
} from 'react-icons/md';
import './NotePage.css';

const NotePage: React.FC = () => {
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState<boolean>(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const quillRef = React.useRef<ReactQuill>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<string>('This Week');
  const [listFilter, setListFilter] = useState<string>('All Lists');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [moreFilter, setMoreFilter] = useState<string>('None');
  const [grouping, setGrouping] = useState<string>('By Completion Status');
  const [selectedFields, setSelectedFields] = useState<number>(3);

  // Editor states
  const [currentSize, setCurrentSize] = useState<any>(false);
  const SIZES = ['small', false, 'large', 'huge'];
  const SIZE_LABELS: Record<string, string> = { 'small': '10', 'false': '12', 'large': '18', 'huge': '24' };

  // Load note from localStorage on mount
  useEffect(() => {
    const savedNote = localStorage.getItem(`note_${(user as any)?._id}_${getDateRange()}`);
    if (savedNote) {
      setNoteContent(savedNote);
    }
  }, [user]);

  // Auto-save note to localStorage
  useEffect(() => {
    if (!user) return;
    
    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem(`note_${(user as any)._id}_${getDateRange()}`, noteContent);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(timeoutId);
  }, [noteContent, user]);

  // Load folders and tasks
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [foldersData, tasksData] = await Promise.all([
          folderApi.getFolders(),
          taskApi.getTasks()
        ]);
        setFolders(foldersData);
        setCompletedTasks(tasksData.filter(t => t.status === 'done'));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    loadData();
  }, [user]);

  // Get date range for display
  const getDateRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
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

  // Text formatting handler for Quill
  const handleFormat = (format: string, value: any) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    
    // Toggle logic for inline styles
    if (typeof value === 'boolean') {
      const currentFormat = editor.getFormat();
      editor.format(format, !currentFormat[format]);
    } else {
      // For block styles or specific values
      editor.format(format, value);
    }
  };

  const handleFontSize = (increment: number) => {
    const currentIndex = SIZES.indexOf(currentSize);
    let newIndex = currentIndex + increment;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= SIZES.length) newIndex = SIZES.length - 1;
    
    const newSize = SIZES[newIndex];
    handleFormat('size', newSize);
    setCurrentSize(newSize);
  };

  const onSelectionChange = (range: any, _source: string, _editor: any) => {
    if (range && quillRef.current) {
      // Use the ref to get the editor instance reliably
      const editorInstance = quillRef.current.getEditor();
      const format = editorInstance.getFormat(range);
      setCurrentSize(format.size || false);
    }
  };

  // Insert embed (image, link, etc)
  const handleInsert = (type: string) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);

    if (type === 'image') {
      const url = prompt('Enter image URL:');
      if (url) editor.insertEmbed(range.index, 'image', url);
    } else if (type === 'link') {
      const url = prompt('Enter link URL:');
      if (url) {
        const index = range.index;
        const length = range.length;
        editor.formatText(index, length, 'link', url);
      }
    } else if (type === 'checkbox') {
        const currentFormat = editor.getFormat();
        if (currentFormat.list === 'checked') {
            editor.format('list', false);
        } else {
            editor.format('list', 'checked');
        }
    }
  };

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
            className="nav-item active"
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
            <span className="nav-item-text">Next 7 Days</span>
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
          <div className="nav-item" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            <span className="nav-item-icon"><FiPlus /></span>
            <span className="nav-item-text">Create Team</span>
          </div>
        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section-title">Filters</div>
        <nav className="sidebar-nav">
          <div className="nav-item" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            <span>Display tasks filtered by list, date, priority, tag, and more</span>
          </div>
        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section-title">Tags</div>
        <nav className="sidebar-nav">
          <div className="nav-item" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            <span>Categorize your tasks with tags. Quickly select a tag by typing "#" when adding a task</span>
          </div>
        </nav>

        <div style={{ flex: 1 }}></div>
        
        <div>
          <div className="sidebar-bottom-btn" onClick={() => navigate('/app')}>
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
      <main className="main-workspace summary-workspace">
        <header className="workspace-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FiList size={24} />
          </button>

          <h1 className="view-title">
            <FiEdit2 style={{ marginRight: '8px' }} />
            Note
          </h1>

          <div className="header-tools">
            {lastSaved && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '12px' }}>
                {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
            <button className="template-btn">Template</button>
            <ProfileMenu onLogout={logout} />
          </div>
        </header>

        <div className="summary-container">
          {/* Main Editor Area */}
          <div className="summary-main">
            {/* Rich Text Toolbar */}
            <div className="editor-toolbar google-docs-toolbar">
              <div className="toolbar-group">
                <button className="toolbar-btn" title="Undo" onMouseDown={(e) => e.preventDefault()} onClick={() => { (quillRef.current?.getEditor() as any).history.undo(); }}><MdUndo /></button>
                <button className="toolbar-btn" title="Redo" onMouseDown={(e) => e.preventDefault()} onClick={() => { (quillRef.current?.getEditor() as any).history.redo(); }}><MdRedo /></button>
                <button className="toolbar-btn" title="Print" onMouseDown={(e) => e.preventDefault()} onClick={() => window.print()}><MdPrint /></button>
              </div>
              <div className="toolbar-divider"></div>
              
              <div className="toolbar-group">
                <button className="toolbar-btn" title="Decrease Font Size" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFontSize(-1)}><MdRemove /></button>
                <div className="font-size-display">{SIZE_LABELS[String(currentSize)] || '12'}</div>
                <button className="toolbar-btn" title="Increase Font Size" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFontSize(1)}><MdAdd /></button>
              </div>
              <div className="toolbar-divider"></div>

              <div className="toolbar-group">
                <button className="toolbar-btn" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold', true)}><MdFormatBold /></button>
                <button className="toolbar-btn" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic', true)}><MdFormatItalic /></button>
                <button className="toolbar-btn" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('underline', true)}><MdFormatUnderlined /></button>
                <button className="toolbar-btn" title="Text Color" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('color', 'red')} style={{ color: 'var(--text-primary)' }}><MdFormatColorText /><div className="color-bar" style={{background: '#000'}}></div></button>
                <button className="toolbar-btn" title="Highlight Color" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('background', '#fef08a')}><MdFormatColorFill /><div className="color-bar" style={{background: '#fef08a'}}></div></button>
              </div>
              <div className="toolbar-divider"></div>

              <div className="toolbar-group">
                <button className="toolbar-btn" title="Insert Link" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsert('link')}><MdInsertLink /></button>
                <button className="toolbar-btn" title="Add Comment" onMouseDown={(e) => e.preventDefault()}><MdComment /><MdAdd size={10} style={{marginLeft: '-4px', marginTop: '-4px'}} /></button>
                <button className="toolbar-btn" title="Insert Image" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsert('image')}><MdInsertPhoto /></button>
              </div>
              <div className="toolbar-divider"></div>

              <div className="toolbar-group">
                <button className="toolbar-btn" title="Align Left" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('align', '')}><MdFormatAlignLeft /></button>
                <button className="toolbar-btn" title="Align Center" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('align', 'center')}><MdFormatAlignCenter /></button>
                <button className="toolbar-btn" title="Align Right" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('align', 'right')}><MdFormatAlignRight /></button>
                <button className="toolbar-btn" title="Justify" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('align', 'justify')}><MdFormatAlignJustify /></button>
              </div>
              <div className="toolbar-divider"></div>

              <div className="toolbar-group">
                <button className="toolbar-btn" title="Checklist" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsert('checkbox')}><MdCheckBox /></button>
                <button className="toolbar-btn" title="Bullet List" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('list', 'bullet')}><MdFormatListBulleted /></button>
                <button className="toolbar-btn" title="Ordered List" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('list', 'ordered')}><MdFormatListNumbered /></button>
                <button className="toolbar-btn" title="More" onMouseDown={(e) => e.preventDefault()}><FiMoreVertical /></button>
              </div>
            </div>

            {/* Date Header */}
            <div className="summary-date-header">
              <h2>{getDateRange()}</h2>
            </div>

            {/* Rich Text Editor */}
            <div className="editor-content">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={noteContent}
                onChange={setNoteContent}
                placeholder="Write your daily note here..."
                modules={{ toolbar: false }}
                className="note-editor-quill"
                onChangeSelection={onSelectionChange}
              />
            </div>

            {/* Completed Tasks Section */}
            <div className="completed-section">
              <h3 className="completed-title">
                Completed
              </h3>
              <div className="completed-tasks">
                {completedTasks.length === 0 ? (
                  <p className="no-completed">No completed tasks this week</p>
                ) : (
                  completedTasks.map(task => (
                    <div key={task._id} className="completed-task-item">
                      <span className="task-bullet">•</span>
                      <span className="task-date">[{new Date(task.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}]</span>
                      <span className="task-text">{task.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Filter Sidebar */}
          <aside className="summary-filters">
            <div className="filter-section">
              <div className="filter-label">Filter</div>
              
              <div className="filter-group">
                <label>Date</label>
                <select 
                  className="filter-select" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option>This Week (18 Jan - 24 Jan)</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Custom Range</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Lists</label>
                <select 
                  className="filter-select"
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option>All Lists</option>
                  {folders.map(folder => (
                    <option key={folder._id} value={folder._id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Not Started</option>
                </select>
              </div>

              <div className="filter-group">
                <label>More</label>
                <select 
                  className="filter-select"
                  value={moreFilter}
                  onChange={(e) => setMoreFilter(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option>None</option>
                  <option>High Priority</option>
                  <option>Medium Priority</option>
                  <option>Low Priority</option>
                </select>
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Display Options</div>
              
              <div className="filter-group">
                <label>Grouping</label>
                <select 
                  className="filter-select"
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option>By Completion Status</option>
                  <option>By Date</option>
                  <option>By Priority</option>
                  <option>By List</option>
                  <option>No Grouping</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Fields</label>
                <select 
                  className="filter-select"
                  value={selectedFields}
                  onChange={(e) => setSelectedFields(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="1">1 selected</option>
                  <option value="2">2 selected</option>
                  <option value="3">3 selected</option>
                  <option value="4">4 selected</option>
                  <option value="5">All fields</option>
                </select>
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-label">Next Period Tasks</div>
              <div className="next-period-placeholder">
                <FiCalendar size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '8px' }}>No upcoming tasks</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modals */}
      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onAddFolder={handleAddFolder}
      />
    </div>
  );
};

export default NotePage;

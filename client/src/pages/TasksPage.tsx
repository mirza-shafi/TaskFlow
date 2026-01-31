import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  List,
  LayoutGrid,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  MoreHorizontal,
  Trash2,
  Edit,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskSkeleton } from '@/components/ui/skeleton-loaders';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { cn } from '@/lib/utils';
import * as tasksApi from '@/lib/api/tasks';
import { toast } from 'sonner';
import { Task, TaskCreate, TaskUpdate } from '@/types/api';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DraggableTask, DroppableColumn } from '@/components/tasks/DraggableTask';

// Map UI status to API status if needed, but better to align UI to API
type TaskStatus = 'todo' | 'doing' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

// Mock data
const mockTasks: Partial<Task>[] = [
  { _id: '1', title: 'Design new dashboard layout', description: 'Create wireframes and mockups', status: 'doing', priority: 'high', dueDate: '2024-01-15', userId: '1', createdAt: '', updatedAt: '', isDeleted: false, tags: ['design'] },
  { _id: '2', title: 'Implement authentication flow', description: 'JWT and session management', status: 'todo', priority: 'high', dueDate: '2024-01-12', userId: '1', createdAt: '', updatedAt: '', isDeleted: false, tags: ['backend', 'auth'] },
  { _id: '3', title: 'Write API documentation', description: 'OpenAPI spec for all endpoints', status: 'todo', priority: 'medium', dueDate: '2024-01-20', userId: '1', createdAt: '', updatedAt: '', isDeleted: false, tags: ['docs'] },
  { _id: '4', title: 'Review pull requests', description: 'Check code quality and tests', status: 'done', priority: 'low', userId: '1', createdAt: '', updatedAt: '', isDeleted: false, tags: ['review'] },
  { _id: '5', title: 'Set up CI/CD pipeline', description: 'GitHub Actions workflow', status: 'doing', priority: 'high', dueDate: '2024-01-18', userId: '1', createdAt: '', updatedAt: '', isDeleted: false, tags: ['devops'] },
  { _id: '6', title: 'Update dependencies', description: 'Security patches and upgrades', status: 'done', priority: 'medium', userId: '1', createdAt: '', updatedAt: '', isDeleted: false, tags: ['maintenance'] },
];

const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: typeof Flag }> = {
  low: { label: 'Low', color: 'text-muted-foreground', icon: Flag },
  medium: { label: 'Medium', color: 'text-warning', icon: Flag },
  high: { label: 'High', color: 'text-destructive', icon: Flag },
  // urgent mapped to high for now as API has max 'high'
};

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle }> = {
  todo: { label: 'To Do', icon: Circle },
  doing: { label: 'In Progress', icon: Clock },
  done: { label: 'Done', icon: CheckCircle2 },
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const isDone = task.status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "group flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 cursor-grab active:cursor-grabbing",
        "hover:shadow-sm hover:border-primary/20",
        isDone && "opacity-60"
      )}
      style={{
        backgroundColor: task.color ? `${task.color}33` : undefined, // 33 is ~20% opacity in hex
        borderColor: task.color ? `${task.color}4D` : undefined, // 4D is ~30% opacity in hex
      }}
    >
      <button
        onClick={() => onToggle(task._id, isDone ? 'todo' : 'done')}
        className={cn(
          "mt-0.5 flex-shrink-0 transition-colors",
          isDone ? "text-success" : "text-muted-foreground hover:text-primary"
        )}
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={cn(
              "font-medium text-sm",
              isDone && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(task._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {task.dueDate && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn("text-xs gap-1", priority?.color)}
          >
            <priority.icon className="h-3 w-3" />
            {priority?.label}
          </Badge>
          {Array.isArray(task.tags) && task.tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="outline" className="text-xs bg-primary/10 border-primary/20">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function KanbanColumn({ status, tasks, onToggle, onDelete, onEdit, onNewTask }: {
  status: TaskStatus;
  tasks: Task[];
  onToggle: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onNewTask: () => void;
}) {
  const config = statusConfig[status];
  const filteredTasks = tasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <config.icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">{config.label}</h3>
        <Badge variant="secondary" className="text-xs ml-auto">
          {filteredTasks.length}
        </Badge>
      </div>

      <DroppableColumn id={status}>
        <div className="flex flex-col gap-2 p-2 rounded-lg bg-muted/30 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <DraggableTask key={task._id} id={task._id}>
                <TaskItem
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </DraggableTask>
            ))}
          </AnimatePresence>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground"
          onClick={onNewTask}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add task
        </Button>
        </div>
      </DroppableColumn>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks...');
      const data = await tasksApi.getTasks();
      console.log('Tasks data received:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array of tasks, got:', typeof data, data);
        toast.error('Invalid response from server');
        setTasks([]);
        return;
      }
      
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: TaskCreate | TaskUpdate) => {
    try {
      if (editingTask) {
        // Update existing task
        await tasksApi.updateTask(editingTask._id, data as TaskUpdate);
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await tasksApi.createTask(data as TaskCreate);
        toast.success('Task created successfully');
      }
      loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
      throw error;
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleToggle = async (id: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? { ...task, status: newStatus } : task
      )
    );

    try {
      await tasksApi.updateTask(id, { status: newStatus });
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
      loadTasks();
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter(t => t._id !== id));

    try {
      await tasksApi.deleteTask(id);
      toast.success('Task moved to trash');
    } catch (error) {
      toast.error('Failed to delete task');
      loadTasks();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column (status)
    if (['todo', 'doing', 'done'].includes(overId)) {
      const newStatus = overId as TaskStatus;
      const task = tasks.find(t => t._id === taskId);
      
      if (task && task.status !== newStatus) {
        // Optimistic update
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, status: newStatus } : t
          )
        );

        try {
          await tasksApi.updateTask(taskId, { status: newStatus });
          toast.success(`Task moved to ${statusConfig[newStatus].label}`);
        } catch (error) {
          toast.error('Failed to update task');
          loadTasks();
        }
      }
    }
  };


  const filteredTasks = tasks
    .filter((task) => !task.isDeleted)
    .filter((task) => filter === 'all' || task.status === filter)
    .filter((task) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

  // Separate active and completed tasks for list view
  const activeTasks = filteredTasks.filter(task => task.status !== 'done');
  const completedTasks = filteredTasks.filter(task => task.status === 'done');


  if (loading && tasks.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <PageHeader title="Tasks" description="Manage your tasks and stay organized" />
        <div className="space-y-4 mt-8">
           {[1, 2, 3].map(i => <TaskSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Tasks"
        description="Manage your tasks and stay organized"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90" onClick={handleNewTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        }
      />

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSave}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as TaskStatus | 'all')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="doing">In Progress</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'kanban' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="space-y-4">
          {/* Active Tasks */}
          <AnimatePresence mode="popLayout">
            {activeTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="space-y-2 mt-8">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-sm font-semibold text-muted-foreground">Completed</h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{completedTasks.length}</span>
              </div>
              <AnimatePresence mode="popLayout">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No tasks found</h3>
              <p className="text-sm text-muted-foreground">
                Create a new task to get started
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            status="todo"
            tasks={tasks.filter((t) => !t.isDeleted)}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onNewTask={handleNewTask}
          />
          <KanbanColumn
            status="doing"
            tasks={tasks.filter((t) => !t.isDeleted)}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onNewTask={handleNewTask}
          />
          <KanbanColumn
            status="done"
            tasks={tasks.filter((t) => !t.isDeleted)}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onNewTask={handleNewTask}
          />
        </div>
      )}
    </div>
  );
}

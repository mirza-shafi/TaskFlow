import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, StickyNote, Target, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as tasksApi from '@/lib/api/tasks';
import * as notesApi from '@/lib/api/notes';
import * as habitsApi from '@/lib/api/habits';
import { toast } from 'sonner';

type Tab = 'task' | 'note' | 'habit';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful create so the dashboard can refresh */
  onCreated?: () => void;
}

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'task',  label: 'Task',  icon: CheckSquare, color: 'text-primary',  bg: 'bg-primary/10'  },
  { id: 'note',  label: 'Note',  icon: StickyNote,  color: 'text-warning',  bg: 'bg-warning/10'  },
  { id: 'habit', label: 'Habit', icon: Target,      color: 'text-success',  bg: 'bg-success/10'  },
];

export function QuickAddModal({ open, onClose, onCreated }: QuickAddModalProps) {
  const [tab, setTab]         = useState<Tab>('task');
  const [loading, setLoading] = useState(false);

  // ── Task state ─────────────────────────────────────────────
  const [taskTitle,    setTaskTitle]    = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate,  setTaskDueDate]  = useState('');

  // ── Note state ─────────────────────────────────────────────
  const [noteTitle,   setNoteTitle]   = useState('');
  const [noteContent, setNoteContent] = useState('');

  // ── Habit state ────────────────────────────────────────────
  const [habitName,     setHabitName]     = useState('');
  const [habitCategory, setHabitCategory] = useState('health');
  const [habitFreq,     setHabitFreq]     = useState<'daily' | 'weekly'>('daily');

  const resetForms = () => {
    setTaskTitle(''); setTaskPriority('medium'); setTaskDueDate('');
    setNoteTitle(''); setNoteContent('');
    setHabitName(''); setHabitCategory('health'); setHabitFreq('daily');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (tab === 'task') {
        if (!taskTitle.trim()) { toast.error('Task title is required'); return; }
        await tasksApi.createTask({
          title: taskTitle.trim(),
          priority: taskPriority,
          ...(taskDueDate ? { dueDate: new Date(taskDueDate).toISOString() } : {}),
        });
        toast.success('✅ Task created!');
      } else if (tab === 'note') {
        if (!noteTitle.trim()) { toast.error('Note title is required'); return; }
        await notesApi.createNote({
          title: noteTitle.trim(),
          content: noteContent.trim(),
        });
        toast.success('📝 Note created!');
      } else {
        if (!habitName.trim()) { toast.error('Habit name is required'); return; }
        await habitsApi.createHabit({
          name: habitName.trim(),
          category: habitCategory,
          frequency: habitFreq,
        });
        toast.success('🎯 Habit created!');
      }
      handleClose();
      onCreated?.();
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
    if (e.key === 'Escape') handleClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Quick Add</h2>
                    <p className="text-xs text-muted-foreground">Create instantly · ⌘+Enter to save</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-1 px-6 pt-4">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      id={`quick-add-tab-${t.id}`}
                      onClick={() => setTab(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? `${t.bg} ${t.color} shadow-sm`
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Form Body */}
              <div className="px-6 py-4 space-y-4 min-h-[220px]">
                <AnimatePresence mode="wait">
                  {tab === 'task' && (
                    <motion.div
                      key="task-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="task-title">Task title *</Label>
                        <Input
                          id="task-title"
                          autoFocus
                          placeholder="What needs to be done?"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Priority</Label>
                          <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as any)}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🟢 Low</SelectItem>
                              <SelectItem value="medium">🟡 Medium</SelectItem>
                              <SelectItem value="high">🔴 High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="task-due">Due date</Label>
                          <Input
                            id="task-due"
                            type="date"
                            value={taskDueDate}
                            onChange={(e) => setTaskDueDate(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === 'note' && (
                    <motion.div
                      key="note-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="note-title">Note title *</Label>
                        <Input
                          id="note-title"
                          autoFocus
                          placeholder="Give your note a title…"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="note-content">Content</Label>
                        <Textarea
                          id="note-content"
                          placeholder="Start writing…"
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          className="resize-none h-24"
                        />
                      </div>
                    </motion.div>
                  )}

                  {tab === 'habit' && (
                    <motion.div
                      key="habit-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="habit-name">Habit name *</Label>
                        <Input
                          id="habit-name"
                          autoFocus
                          placeholder="e.g. Morning run, Read 30 mins…"
                          value={habitName}
                          onChange={(e) => setHabitName(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Category</Label>
                          <Select value={habitCategory} onValueChange={setHabitCategory}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="health">💪 Health</SelectItem>
                              <SelectItem value="learning">📚 Learning</SelectItem>
                              <SelectItem value="productivity">⚡ Productivity</SelectItem>
                              <SelectItem value="mindfulness">🧘 Mindfulness</SelectItem>
                              <SelectItem value="social">👥 Social</SelectItem>
                              <SelectItem value="other">🎯 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Frequency</Label>
                          <Select value={habitFreq} onValueChange={(v) => setHabitFreq(v as any)}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">📅 Daily</SelectItem>
                              <SelectItem value="weekly">📆 Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                <p className="text-xs text-muted-foreground">⌘ + Enter to save</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    id="quick-add-submit-btn"
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 gap-1.5 min-w-[100px]"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        Create {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

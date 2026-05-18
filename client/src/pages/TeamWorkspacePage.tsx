import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, CheckSquare, StickyNote, Activity,
  Plus, Crown, Shield, User, Loader2, RefreshCw,
  Clock, Flag, Circle, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import * as teamsApi from '@/lib/api/teams';
import * as tasksApi from '@/lib/api/tasks';
import * as notesApi from '@/lib/api/notes';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { getAvatarUrl } from '@/lib/utils/avatar';
import type { Team, Task, Note } from '@/types/api';

// ─── helpers ────────────────────────────────────────────────────────────────
const initials = (s: string) => s.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const priorityConfig = {
  high:   { color: 'text-red-500',    bg: 'bg-red-500/10',    icon: '🔴', label: 'High'   },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: '🟡', label: 'Medium' },
  low:    { color: 'text-green-500',  bg: 'bg-green-500/10',  icon: '🟢', label: 'Low'    },
};

const statusConfig = {
  todo:  { label: 'To Do',       icon: Circle,        color: 'text-muted-foreground' },
  doing: { label: 'In Progress', icon: RefreshCw,     color: 'text-blue-500'         },
  done:  { label: 'Done',        icon: CheckCircle2,  color: 'text-green-500'        },
};

const roleConfig: Record<string, { icon: typeof Crown; color: string }> = {
  owner:  { icon: Crown,  color: 'text-yellow-500' },
  admin:  { icon: Shield, color: 'text-blue-500'   },
  member: { icon: User,   color: 'text-muted-foreground' },
};

// ─── Create Task Dialog ───────────────────────────────────────────────────────
function CreateTaskDialog({
  team, onCreated,
}: { team: Team; onCreated: () => void }) {
  const [open, setOpen]           = useState(false);
  const [title, setTitle]         = useState('');
  const [desc, setDesc]           = useState('');
  const [priority, setPriority]   = useState<'low'|'medium'|'high'>('medium');
  const [assignee, setAssignee]   = useState('unassigned');
  const [dueDate, setDueDate]     = useState('');
  const [loading, setLoading]     = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const task = await tasksApi.createTask({
        title: title.trim(),
        description: desc.trim(),
        priority,
        teamId: team._id,
        ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
      });
      // If assignee selected, assign them
      if (assignee && assignee !== 'unassigned') {
        await tasksApi.assignTask(task._id, { userId: assignee, role: 'assignee' });
      }
      toast.success('Task created!');
      setTitle(''); setDesc(''); setPriority('medium'); setAssignee('unassigned'); setDueDate('');
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to create task');
    } finally { setLoading(false); }
  };

  // Owner + members list for assignee dropdown
  const allMembers = [
    { userId: team.ownerId, label: 'Owner' },
    ...team.members.map(m => ({ userId: m.userId, label: m.email })),
  ];

  return (
    <>
      <Button id="team-create-task-btn" size="sm" className="bg-gradient-primary hover:opacity-90"
        onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" /> Add Task
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Team Task</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input autoFocus placeholder="What needs to be done?" value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Add details…" value={desc}
                onChange={e => setDesc(e.target.value)} className="resize-none h-20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={v => setPriority(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder="Select member…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {allMembers.map(m => (
                    <SelectItem key={m.userId} value={m.userId}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Create</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Create Note Dialog ───────────────────────────────────────────────────────
function CreateNoteDialog({ team, onCreated }: { team: Team; onCreated: () => void }) {
  const [open, setOpen]       = useState(false);
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      await notesApi.createNote({ title: title.trim(), content: content.trim() });
      toast.success('Note created!');
      setTitle(''); setContent('');
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to create note');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" /> Add Note
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Team Note</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input autoFocus placeholder="Note title…" value={title}
                onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea placeholder="Write your note…" value={content}
                onChange={e => setContent(e.target.value)} className="resize-none h-28" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, members }: { task: Task; members: Team['members'] }) {
  const p = priorityConfig[task.priority] ?? priorityConfig.medium;
  const s = statusConfig[task.status]     ?? statusConfig.todo;
  const StatusIcon = s.icon;

  const assignees = (task as any).collaborators?.filter((c: any) => c.role === 'assignee') ?? [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <StatusIcon className={cn('h-4 w-4 mt-0.5 shrink-0', s.color)} />
            <div className="min-w-0">
              <p className={cn('text-sm font-medium', task.status === 'done' && 'line-through text-muted-foreground')}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className={cn('text-xs shrink-0', p.color, p.bg)}>
            {p.icon} {p.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5">
              {assignees.map((a: any) => {
                const m = members.find(mem => mem.userId === a.userId);
                return (
                  <Avatar key={a.userId} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {initials(m?.email ?? '?')}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeamWorkspacePage() {
  const { teamId }            = useParams<{ teamId: string }>();
  const navigate              = useNavigate();
  const { user }              = useAuth();
  const [team, setTeam]       = useState<Team | null>(null);
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [notes, setNotes]     = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('tasks');

  const currentUserId = user?.id ?? user?._id ?? '';

  const load = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const [t, ts, ns] = await Promise.all([
        teamsApi.getTeam(teamId),
        teamsApi.getTeamTasks(teamId),
        teamsApi.getTeamNotes(teamId),
      ]);
      setTeam(t);
      setTasks(ts);
      setNotes(ns);
    } catch {
      toast.error('Failed to load team workspace');
      navigate('/teams');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [teamId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!team) return null;

  const isOwner   = team.ownerId === currentUserId;
  const myRole    = team.members.find(m => m.userId === currentUserId)?.role ?? 'member';
  const canManage = isOwner || myRole === 'admin';

  // Stats
  const todoCnt  = tasks.filter(t => t.status === 'todo').length;
  const doingCnt = tasks.filter(t => t.status === 'doing').length;
  const doneCnt  = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back button */}
      <Link to="/app/teams" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Teams
      </Link>

      {/* Team Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {team.description && <p className="text-muted-foreground">{team.description}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{team.members.length + 1} members</span>
              {isOwner && <Badge variant="secondary" className="text-yellow-500 bg-yellow-500/10 gap-1"><Crown className="h-3 w-3" /> Owner</Badge>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Tasks',  value: tasks.length, color: 'text-primary',     bg: 'bg-primary/10'     },
          { label: 'To Do',        value: todoCnt,       color: 'text-muted-foreground', bg: 'bg-muted'    },
          { label: 'In Progress',  value: doingCnt,      color: 'text-blue-500',   bg: 'bg-blue-500/10'    },
          { label: 'Done',         value: doneCnt,       color: 'text-green-500',  bg: 'bg-green-500/10'   },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-1.5">
              <CheckSquare className="h-4 w-4" /> Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <StickyNote className="h-4 w-4" /> Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users className="h-4 w-4" /> Members ({team.members.length + 1})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {tab === 'tasks' && <CreateTaskDialog team={team} onCreated={load} />}
            {tab === 'notes' && <CreateNoteDialog team={team} onCreated={load} />}
          </div>
        </div>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          {tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create the first task for this team</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {(['todo', 'doing', 'done'] as const).map(status => {
                const group = tasks.filter(t => t.status === status);
                if (!group.length) return null;
                const sc = statusConfig[status];
                const Icon = sc.icon;
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('h-4 w-4', sc.color)} />
                      <span className="text-sm font-medium">{sc.label}</span>
                      <Badge variant="secondary" className="text-xs">{group.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.map(task => <TaskCard key={task._id} task={task} members={team.members} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          {notes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20">
              <StickyNote className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="font-medium">No notes yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create a shared note for this team</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <Card key={note._id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {note.content ? (
                      <p className="text-xs text-muted-foreground line-clamp-3">{note.content}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Empty note</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="space-y-2">
            {/* Owner row */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-sm bg-yellow-500/10 text-yellow-500">
                    {initials(team.ownerId === currentUserId ? (user?.name ?? 'Me') : 'OW')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {team.ownerId === currentUserId ? `${user?.name} (you)` : 'Owner'}
                  </p>
                  <p className="text-xs text-muted-foreground">Team owner</p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1 text-yellow-500 bg-yellow-500/10">
                <Crown className="h-3 w-3" /> Owner
              </Badge>
            </div>

            {team.members.map(member => {
              const cfg  = roleConfig[member.role] ?? roleConfig.member;
              const Icon = cfg.icon;
              const isSelf = member.userId === currentUserId;
              return (
                <div key={member.userId}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {member.avatarUrl && (
                        <AvatarImage src={getAvatarUrl(member.avatarUrl)} alt={member.email} className="object-cover" />
                      )}
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {initials(member.name || member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.email}{isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={cn('gap-1 text-xs', cfg.color)}>
                    <Icon className="h-3 w-3" />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

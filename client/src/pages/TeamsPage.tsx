import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Users, Settings, UserPlus, Mail, MoreHorizontal,
  Crown, Shield, User, LogOut, Trash2, Activity,
  Loader2, RefreshCw, AlertTriangle, Clock, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { cn } from '@/lib/utils';
import * as teamsApi from '@/lib/api/teams';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import type { Team, TeamMember, TeamActivity } from '@/types/api';

// ─── helpers ────────────────────────────────────────────────────────────────

const roleConfig: Record<string, { label: string; icon: typeof Crown; color: string; bg: string }> = {
  owner:  { label: 'Owner',  icon: Crown,  color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  admin:  { label: 'Admin',  icon: Shield, color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
  member: { label: 'Member', icon: User,   color: 'text-muted-foreground', bg: 'bg-muted'   },
};

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Create Team Dialog ──────────────────────────────────────────────────────

function CreateTeamDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen]         = useState(false);
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [loading, setLoading]   = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Team name is required'); return; }
    setLoading(true);
    try {
      await teamsApi.createTeam({ name: name.trim(), description: desc.trim() });
      toast.success(`Team "${name}" created!`);
      setName(''); setDesc('');
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to create team');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button id="create-team-btn" className="bg-gradient-primary hover:opacity-90" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> Create Team
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Build a team to collaborate on tasks and notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Team name *</Label>
              <Input id="team-name" autoFocus placeholder="e.g. Engineering, Design…" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-desc">Description</Label>
              <Textarea id="team-desc" placeholder="What does this team work on?" value={desc}
                onChange={e => setDesc(e.target.value)} className="resize-none h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading} className="bg-gradient-primary hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" />Create</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Invite Dialog ───────────────────────────────────────────────────────────

function InviteDialog({ team, onUpdated }: { team: Team; onUpdated: () => void }) {
  const [open, setOpen]       = useState(false);
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) { toast.error('Email is required'); return; }
    setLoading(true);
    try {
      await teamsApi.inviteTeamMember(team._id, { email: email.trim(), role });
      toast.success(`${email} added to ${team.name}`);
      setEmail('');
      setOpen(false);
      onUpdated();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to invite member');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button id={`invite-btn-${team._id}`} variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-1.5" /> Invite
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to {team.name}</DialogTitle>
            <DialogDescription>Add a teammate by their email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address *</Label>
              <Input id="invite-email" autoFocus type="email" placeholder="colleague@company.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={v => setRole(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">👤 Member</SelectItem>
                  <SelectItem value="admin">🛡️ Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleInvite} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4 mr-1.5" />Send Invite</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Edit Team Dialog ─────────────────────────────────────────────────────────

function EditTeamDialog({ team, onUpdated, open, onClose }: {
  team: Team; onUpdated: () => void; open: boolean; onClose: () => void;
}) {
  const [name, setName]       = useState(team.name);
  const [desc, setDesc]       = useState(team.description ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      await teamsApi.updateTeam(team._id, { name: name.trim(), description: desc.trim() });
      toast.success('Team updated');
      onClose(); onUpdated();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to update team');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Team name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="resize-none h-20" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Activity Panel ───────────────────────────────────────────────────────────

function ActivityPanel({ teamId }: { teamId: string }) {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    teamsApi.getTeamActivity(teamId, 20)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  if (!activities.length) return (
    <div className="text-center py-10 text-muted-foreground">
      <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm">No activity yet</p>
    </div>
  );

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {activities.map(a => (
        <div key={a._id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {initials(a.userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{a.userName}</span>{' '}
              <span className="text-muted-foreground">{a.action}</span>{' '}
              {a.resourceName && <span className="font-medium">{a.resourceName}</span>}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />{relativeTime(a.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({
  team, currentUserId, onRefresh,
}: { team: Team; currentUserId: string; onRefresh: () => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded]     = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Confirm dialog state
  type ConfirmAction = 'delete' | 'leave' | { type: 'remove'; memberId: string; email: string };
  const [confirmState, setConfirmState] = useState<{ action: ConfirmAction } | null>(null);

  const isOwner = team.ownerId === currentUserId;
  const myRole  = team.members.find(m => m.userId === currentUserId)?.role ?? 'member';
  // Owner is stored as `ownerId`, NOT inside `members[]`, so we must check isOwner directly
  const canManage = isOwner || myRole === 'admin';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await teamsApi.deleteTeam(team._id);
      toast.success(`Team "${team.name}" deleted`);
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to delete team');
    } finally { setDeleting(false); setConfirmState(null); }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await teamsApi.removeTeamMember(team._id, currentUserId);
      toast.success(`Left "${team.name}"`);
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to leave team');
    } finally { setLeaving(false); setConfirmState(null); }
  };

  const handleRemoveMember = async (memberId: string, email: string) => {
    setRemovingId(memberId);
    try {
      await teamsApi.removeTeamMember(team._id, memberId);
      toast.success(`${email} removed`);
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to remove member');
    } finally { setRemovingId(null); setConfirmState(null); }
  };

  const handleRoleChange = async (memberId: string, newRole: 'member' | 'admin') => {
    setUpdatingId(memberId);
    try {
      await teamsApi.updateMemberRole(team._id, memberId, newRole);
      toast.success('Role updated');
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to update role');
    } finally { setUpdatingId(null); }
  };

  return (
    <>
      <motion.div layout>
        <Card className="overflow-hidden border hover:shadow-lg transition-all duration-300">
          {/* Card Header */}
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base">{team.name}</CardTitle>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{team.description}</p>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" /> Edit Team
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem
                      onClick={() => setConfirmState({ action: 'leave' })}
                      className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Leave Team
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setConfirmState({ action: 'delete' })}
                        className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Team
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Member avatars + invite */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map(m => (
                    <Avatar key={m.userId} className="h-8 w-8 border-2 border-background">
                      {m.avatarUrl && (
                        <AvatarImage src={getAvatarUrl(m.avatarUrl)} alt={m.email} className="object-cover" />
                      )}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials(m.name || m.email)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 5 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium border-2 border-background">
                      +{team.members.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
              </div>
              <InviteDialog team={team} onUpdated={onRefresh} />
            </div>

            {/* Open Workspace button */}
            <Button
              variant="default"
              size="sm"
              className="w-full mb-2 bg-gradient-primary hover:opacity-90 text-primary-foreground"
              onClick={() => navigate(`/app/teams/${team._id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-1.5" /> Open Workspace
            </Button>

            {/* Expand/collapse */}
            <Button
              variant="ghost" size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4 mr-1.5" /> : <ChevronDown className="h-4 w-4 mr-1.5" />}
              {expanded ? 'Hide details' : 'Show details'}
            </Button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="expanded"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Tabs defaultValue="members" className="mt-3">
                    <TabsList className="w-full">
                      <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
                      <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>

                    {/* Members Tab */}
                    <TabsContent value="members" className="mt-3 space-y-1.5">
                      {team.members.map(member => {
                        const cfg = roleConfig[member.role] ?? roleConfig.member;
                        const Icon = cfg.icon;
                        const isSelf = member.userId === currentUserId;
                        return (
                          <div key={member.userId}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/40 transition-colors group">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar className="h-8 w-8 shrink-0">
                                {member.avatarUrl && (
                                  <AvatarImage src={getAvatarUrl(member.avatarUrl)} alt={member.email} className="object-cover" />
                                )}
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {initials(member.name || member.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {member.email}{isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">Joined {relativeTime(member.joinedAt)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Role badge / change */}
                              {isOwner && member.role !== 'owner' ? (
                                <Select
                                  value={member.role}
                                  onValueChange={v => handleRoleChange(member.userId, v as any)}
                                  disabled={updatingId === member.userId}
                                >
                                  <SelectTrigger className="h-7 w-28 text-xs">
                                    {updatingId === member.userId
                                      ? <Loader2 className="h-3 w-3 animate-spin" />
                                      : <SelectValue />}
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="secondary" className={cn('gap-1 text-xs', cfg.color, cfg.bg)}>
                                  <Icon className="h-3 w-3" />{cfg.label}
                                </Badge>
                              )}

                              {/* Remove button */}
                              {member.role !== 'owner' && !isSelf && (
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={removingId === member.userId}
                                  onClick={() => setConfirmState({
                                    action: { type: 'remove', memberId: member.userId, email: member.email }
                                  })}
                                >
                                  {removingId === member.userId
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <Trash2 className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="mt-3">
                      <ActivityPanel teamId={team._id} />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit dialog */}
      {isOwner && (
        <EditTeamDialog
          team={team}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={onRefresh}
        />
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmState}
        title={
          !confirmState ? '' :
          confirmState.action === 'delete' ? `Delete "${team.name}"?` :
          confirmState.action === 'leave'  ? `Leave "${team.name}"?` :
          `Remove member?`
        }
        description={
          !confirmState ? '' :
          confirmState.action === 'delete'
            ? `This will permanently delete the team and remove all members. This cannot be undone.`
            : confirmState.action === 'leave'
            ? `You will lose access to this team and its resources.`
            : `Remove ${(confirmState.action as any).email} from the team? They will lose access immediately.`
        }
        confirmLabel={
          !confirmState ? 'Confirm' :
          confirmState.action === 'delete' ? 'Delete Team' :
          confirmState.action === 'leave'  ? 'Leave Team' :
          'Remove'
        }
        loading={deleting || leaving || !!removingId}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          if (!confirmState) return;
          if (confirmState.action === 'delete') handleDelete();
          else if (confirmState.action === 'leave') handleLeave();
          else handleRemoveMember(
            (confirmState.action as any).memberId,
            (confirmState.action as any).email
          );
        }}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const { user }                    = useAuth();
  const [teams, setTeams]           = useState<Team[]>([]);
  const [loading, setLoading]       = useState(true);

  // Backend serialises MongoDB _id → "id" in JSON response
  const currentUserId = user?.id ?? user?._id ?? '';

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.getTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load teams');
      setTeams([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTeams(); }, []);

  const teamsOwned  = teams.filter(t => t.ownerId === currentUserId).length;
  const totalMembers = [...new Set(teams.flatMap(t => t.members.map(m => m.userId)))].length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teams"
        description="Collaborate with your team members"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadTeams} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
              Refresh
            </Button>
            <CreateTeamDialog onCreated={loadTeams} />
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Teams',  value: teams.length,   icon: Users,  color: 'text-primary',  bg: 'bg-primary/10'  },
          { label: 'Total Members', value: totalMembers,   icon: User,   color: 'text-success',  bg: 'bg-success/10'  },
          { label: 'Teams Owned',   value: teamsOwned,     icon: Crown,  color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('p-3 rounded-xl', stat.bg, stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '—' : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Teams Grid */}
      {!loading && teams.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {teams.map(team => (
            <TeamCard
              key={team._id}
              team={team}
              currentUserId={currentUserId}
              onRefresh={loadTeams}
            />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && teams.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <Users className="h-10 w-10 text-muted-foreground opacity-40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Create a team to start collaborating on tasks and notes with your teammates.
          </p>
          <CreateTeamDialog onCreated={loadTeams} />
        </motion.div>
      )}
    </div>
  );
}

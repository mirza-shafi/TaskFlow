import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Users,
  Settings,
  UserPlus,
  Mail,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  LogOut,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import * as teamsApi from '@/lib/api/teams';
import { toast } from 'sonner';
import { Team, TeamMember, TeamCreate } from '@/types/api';

// Extended type for UI to handle populated user data if available, or fallbacks
interface UiTeamMember extends TeamMember {
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface UiTeam extends Team {
  members: UiTeamMember[];
  memberCount?: number; // API might return this or we calc from members.length
}

// Mock data
const mockTeams: UiTeam[] = [
  {
    _id: '1',
    name: 'Engineering',
    description: 'Product development team',
    ownerId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    memberCount: 3,
    members: [
      { userId: '1', email: 'john@example.com', role: 'owner', joinedAt: '2024-01-01', user: { id: '1', email: 'john@example.com', full_name: 'John Doe' } },
      { userId: '2', email: 'jane@example.com', role: 'admin', joinedAt: '2024-01-02', user: { id: '2', email: 'jane@example.com', full_name: 'Jane Smith' } },
      { userId: '3', email: 'mike@example.com', role: 'member', joinedAt: '2024-01-05', user: { id: '3', email: 'mike@example.com', full_name: 'Mike Johnson' } },
    ],
  },
  {
    _id: '2',
    name: 'Design',
    description: 'UI/UX design team',
    ownerId: '2',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    memberCount: 2,
    members: [
      { userId: '2', email: 'jane@example.com', role: 'owner', joinedAt: '2024-01-05', user: { id: '2', email: 'jane@example.com', full_name: 'Jane Smith' } },
      { userId: '1', email: 'john@example.com', role: 'member', joinedAt: '2024-01-06', user: { id: '1', email: 'john@example.com', full_name: 'John Doe' } },
    ],
  },
  {
    _id: '3',
    name: 'Marketing',
    description: 'Growth and marketing team',
    ownerId: '3',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14',
    memberCount: 1,
    members: [
      { userId: '3', email: 'mike@example.com', role: 'owner', joinedAt: '2024-01-08', user: { id: '3', email: 'mike@example.com', full_name: 'Mike Johnson' } },
    ],
  },
];

// Update key type to match string if TeamRole is string
const roleConfig: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-warning' },
  admin: { label: 'Admin', icon: Shield, color: 'text-primary' },
  member: { label: 'Member', icon: User, color: 'text-muted-foreground' },
  viewer: { label: 'Viewer', icon: User, color: 'text-muted-foreground' },
};

function InviteDialog({ teamId }: { teamId: string }) {
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    try {
      await teamsApi.inviteTeamMember(teamId, { email });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
    } catch (error) {
       toast.error('Failed to invite member');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new member to your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleInvite} disabled={!email}>
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TeamCard({ team }: { team: UiTeam }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {team.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-base">{team.name}</CardTitle>
                {team.description && (
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {team.members.slice(0, 4).map((member) => (
                  <Avatar key={member.userId} className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">
                       {(member.user?.full_name || member.email).split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(team.memberCount || team.members.length) > 4 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium border-2 border-background">
                    +{(team.memberCount || team.members.length) - 4}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {team.memberCount || team.members.length} members
              </span>
            </div>

            <InviteDialog teamId={team._id} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide members' : 'Show members'}
          </Button>

          <motion.div
            initial={false}
            animate={{ height: expanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-2">
              {team.members.map((member) => {
                const role = roleConfig[member.role];
                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(member.user?.full_name || member.email).split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.user?.full_name || member.email}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("gap-1", role.color)}>
                      <role.icon className="h-3 w-3" />
                      {role.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<UiTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.getTeams();
      // Cast data to UiTeam and maybe populate with mock names if needed (not doing here)
      // Assuming members come from API as TeamMember[]
      setTeams(Array.isArray(data) ? (data as unknown as UiTeam[]) : []);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
      setTeams(mockTeams);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teams"
        description="Collaborate with your team members"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teams.length}</p>
              <p className="text-xs text-muted-foreground">Active Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {teams.reduce((acc, t) => acc + (t.memberCount || t.members.length), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {teams.filter((t) => t.ownerId === '1').length}
              </p>
              <p className="text-xs text-muted-foreground">Teams Owned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <TeamCard key={team._id} team={team} />
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No teams yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a team to start collaborating
          </p>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Team
          </Button>
        </motion.div>
      )}
    </div>
  );
}

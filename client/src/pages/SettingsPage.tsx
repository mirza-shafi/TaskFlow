import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Key,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import * as usersApi from '@/lib/api/users';
import * as authApi from '@/lib/api/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EditProfileDialog } from '@/components/dialogs/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/dialogs/ChangePasswordDialog';
import { ActiveSessionsDialog } from '@/components/dialogs/ActiveSessionsDialog';
import { DeleteAccountDialog } from '@/components/dialogs/DeleteAccountDialog';
import { getAvatarUrl, getUserInitials } from '@/lib/utils/avatar';
import type { User as UserType } from '@/types/api';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
            theme === t.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary/50"
          )}
        >
          <t.icon className="h-4 w-4" />
          <span className="text-sm font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { user: authUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [activeSessionsOpen, setActiveSessionsOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [logoutAllConfirmOpen, setLogoutAllConfirmOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    taskAssigned: true,
    taskShared: true,
    noteShared: true,
    teamInvite: true,
    teamMemberAdded: true,
    habitMilestone: true,
    habitShared: true,
    folderShared: true,
    commentAdded: true,
    mention: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getProfile();
      setProfile(data);
      // Load notification preferences from user data
      if (data.notificationPreferences) {
        setNotificationPrefs(data.notificationPreferences);
      }
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logoutAllDevices();
      toast.success('Logged out from all devices');
      setLogoutAllConfirmOpen(false);
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout from all devices');
      console.error('Logout all error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileUpdated = async (updatedUser: UserType) => {
    setProfile(updatedUser);
    await refreshUser();
  };

  const handleAccountDeleted = () => {
    // Account deleted, redirect to home page
    navigate('/');
  };

  const handleNotificationPrefChange = async (key: keyof typeof notificationPrefs, value: boolean) => {
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);
    
    try {
      await usersApi.updateProfile({ notificationPreferences: newPrefs });
      toast.success('Notification preferences updated');
    } catch (error) {
      // Revert on error
      setNotificationPrefs(notificationPrefs);
      toast.error('Failed to update preferences');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {profile?.avatarUrl && <AvatarImage src={getAvatarUrl(profile.avatarUrl)} alt={profile.name} />}
              <AvatarFallback className="text-lg">{getUserInitials(profile?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile?.name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {formatDate(profile?.createdAt)}
              </p>
            </div>
            <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize how TaskFlow looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Theme</Label>
              <ThemeSelector />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Configure how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch 
                  checked={notificationPrefs.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationPrefChange('emailNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="pt-3 pb-2 px-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Notification Types
                </p>
              </div>
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Task Assigned</p>
                  <p className="text-xs text-muted-foreground">When someone assigns you a task</p>
                </div>
                <Switch 
                  checked={notificationPrefs.taskAssigned}
                  onCheckedChange={(checked) => handleNotificationPrefChange('taskAssigned', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Task Shared</p>
                  <p className="text-xs text-muted-foreground">When a task is shared with you</p>
                </div>
                <Switch 
                  checked={notificationPrefs.taskShared}
                  onCheckedChange={(checked) => handleNotificationPrefChange('taskShared', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Note Shared</p>
                  <p className="text-xs text-muted-foreground">When a note is shared with you</p>
                </div>
                <Switch 
                  checked={notificationPrefs.noteShared}
                  onCheckedChange={(checked) => handleNotificationPrefChange('noteShared', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Team Invitations</p>
                  <p className="text-xs text-muted-foreground">When you're invited to join a team</p>
                </div>
                <Switch 
                  checked={notificationPrefs.teamInvite}
                  onCheckedChange={(checked) => handleNotificationPrefChange('teamInvite', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Team Members</p>
                  <p className="text-xs text-muted-foreground">When someone joins your team</p>
                </div>
                <Switch 
                  checked={notificationPrefs.teamMemberAdded}
                  onCheckedChange={(checked) => handleNotificationPrefChange('teamMemberAdded', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Habit Milestones</p>
                  <p className="text-xs text-muted-foreground">Celebrate your achievements</p>
                </div>
                <Switch 
                  checked={notificationPrefs.habitMilestone}
                  onCheckedChange={(checked) => handleNotificationPrefChange('habitMilestone', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Habit Shared</p>
                  <p className="text-xs text-muted-foreground">Accountability partner requests</p>
                </div>
                <Switch 
                  checked={notificationPrefs.habitShared}
                  onCheckedChange={(checked) => handleNotificationPrefChange('habitShared', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Folder Shared</p>
                  <p className="text-xs text-muted-foreground">When a folder is shared with you</p>
                </div>
                <Switch 
                  checked={notificationPrefs.folderShared}
                  onCheckedChange={(checked) => handleNotificationPrefChange('folderShared', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Comments</p>
                  <p className="text-xs text-muted-foreground">When someone comments on your items</p>
                </div>
                <Switch 
                  checked={notificationPrefs.commentAdded}
                  onCheckedChange={(checked) => handleNotificationPrefChange('commentAdded', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">Mentions</p>
                  <p className="text-xs text-muted-foreground">When someone mentions you</p>
                </div>
                <Switch 
                  checked={notificationPrefs.mention}
                  onCheckedChange={(checked) => handleNotificationPrefChange('mention', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Secure your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div 
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setChangePasswordOpen(true)}
              >
                <div>
                  <p className="text-sm font-medium">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your password</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <Separator />
              <div 
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setActiveSessionsOpen(true)}
              >
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage your logged-in devices</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out of all devices</p>
              <p className="text-xs text-muted-foreground">Log out from all active sessions</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLogoutAllConfirmOpen(true)} 
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Sign Out All'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        user={profile}
        onProfileUpdated={handleProfileUpdated}
      />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <ActiveSessionsDialog
        open={activeSessionsOpen}
        onOpenChange={setActiveSessionsOpen}
      />

      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        onAccountDeleted={handleAccountDeleted}
      />

      {/* Logout All Confirmation Dialog */}
      <AlertDialog open={logoutAllConfirmOpen} onOpenChange={setLogoutAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Sign out from all devices?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out from all devices and locations where you're currently signed in, 
              including this device. You'll need to sign in again to continue using TaskFlow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutAll}
              disabled={isLoggingOut}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                'Yes, Sign Out All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

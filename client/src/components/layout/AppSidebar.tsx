import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  StickyNote,
  Target,
  Users,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/providers/AuthProvider';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import * as usersApi from '@/lib/api/users';
import { getAvatarUrl } from '@/lib/utils/avatar';
import type { User as UserType } from '@/types/api';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSearch: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
  { icon: StickyNote, label: 'Notes', path: '/app/notes' },
  { icon: Target, label: 'Habits', path: '/app/habits' },
  { icon: Users, label: 'Teams', path: '/app/teams' },
];

const bottomNavItems = [
  { icon: Trash2, label: 'Trash', path: '/app/trash' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export function AppSidebar({ collapsed, onToggle, onOpenSearch }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserType | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await usersApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile in sidebar:', error);
      }
    };
    
    // If we have authUser, also set it initially to avoid flicker, then fetch fresh
    if (authUser) {
      setProfile(authUser);
    }
    loadProfile();
  }, [authUser]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-sidebar-foreground whitespace-nowrap"
              >
                TaskFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search and Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 justify-start gap-2 h-9 px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0 flex-none"
            )}
            onClick={onOpenSearch}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm">Search...</span>
                <kbd className="kbd hidden sm:inline-flex">⌘K</kbd>
              </>
            )}
          </Button>
          {!collapsed && <NotificationCenter />}
        </div>
        {collapsed && (
          <div className="flex justify-center">
            <NotificationCenter />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 h-9 px-3 rounded-md text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-2 space-y-1 border-t border-sidebar-border">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 h-9 px-3 rounded-md text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        {/* Theme Toggle */}
        <div className={cn("flex items-center gap-3 h-9 px-3", collapsed && "justify-center px-0")}>
          <ThemeToggle collapsed={collapsed} />
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/50 cursor-pointer outline-none",
              collapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8">
                {(profile?.avatarUrl || authUser?.avatarUrl) && (
                  <AvatarImage 
                    src={getAvatarUrl(profile?.avatarUrl || authUser?.avatarUrl)} 
                    alt={profile?.name || authUser?.name} 
                    className="object-cover" 
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(profile?.name || authUser?.name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 overflow-hidden"
                  >
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.name || authUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile?.email || authUser?.email || ''}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}

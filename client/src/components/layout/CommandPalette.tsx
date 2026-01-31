import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  CheckSquare,
  StickyNote,
  Target,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Moon,
  Sun,
  LogOut,
  Trash2,
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border-0">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/tasks'))}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/notes'))}>
              <StickyNote className="mr-2 h-4 w-4" />
              Notes
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/habits'))}>
              <Target className="mr-2 h-4 w-4" />
              Habits
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/teams'))}>
              <Users className="mr-2 h-4 w-4" />
              Teams
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => navigate('/tasks/new'))}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/notes/new'))}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Note
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/trash'))}>
              <Trash2 className="mr-2 h-4 w-4" />
              View Trash
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}>
              {resolvedTheme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              Toggle Theme
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}

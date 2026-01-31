import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  StickyNote,
  Target,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onOpenSearch: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
  { icon: StickyNote, label: 'Notes', path: '/app/notes' },
  { icon: Target, label: 'Habits', path: '/app/habits' },
];

export function MobileNav({ onOpenSearch }: MobileNavProps) {
  return (
    <nav className="flex items-center justify-around h-16 px-2 border-t border-border bg-background safe-area-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>
              <span className="text-2xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
      
      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-5 w-5" />
        <span className="text-2xs font-medium">Search</span>
      </button>
    </nav>
  );
}

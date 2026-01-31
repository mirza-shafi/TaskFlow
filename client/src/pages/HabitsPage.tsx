import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Check,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import * as habitsApi from '@/lib/api/habits';
import { toast } from 'sonner';
import { Habit, HabitCreate, HabitUpdate } from '@/types/api';
import { HabitDialog } from '@/components/habits/HabitDialog';



// Generate heatmap data for the last 365 days
const generateHeatmapData = () => {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
    });
  }
  
  return data;
};

const heatmapData = generateHeatmapData();

function HeatmapCell({ count, date }: { count: number; date: string }) {
  const getLevel = (c: number) => {
    if (c === 0) return 0;
    if (c <= 1) return 1;
    if (c <= 2) return 2;
    if (c <= 3) return 3;
    if (c <= 4) return 4;
    return 5;
  };

  return (
    <div
      title={`${date}: ${count} completions`}
      className={cn("w-3 h-3 rounded-sm transition-colors", `heatmap-level-${getLevel(count)}`)}
    />
  );
}

function ActivityHeatmap({ refreshTrigger }: { refreshTrigger: number }) {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  
  useEffect(() => {
    loadHeatmap();
  }, [refreshTrigger]);

  const loadHeatmap = async () => {
    try {
      const result = await habitsApi.getHeatmap();
      const resultMap = new Map(result.map(i => [i.date, i.count]));
      
      const fullData: { date: string; count: number }[] = [];
      const now = new Date();
      const currentYear = now.getFullYear();
      
      const startDate = new Date(currentYear, 0, 1); // Jan 1
      const endDate = new Date(currentYear, 11, 31); // Dec 31
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Use local time components to avoid UTC shift (e.g. Jan 1 -> Dec 31)
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        fullData.push({
          date: dateStr,
          count: resultMap.get(dateStr) || 0
        });
      }
      setData(fullData);
    } catch (error) {
      console.error("Failed to load heatmap", error);
    }
  };

  // Group by weeks with proper padding for the first week
  const weeks: ({ date: string; count: number } | null)[][] = [];
  
  if (data.length > 0) {
    const firstDate = new Date(data[0].date);
    const startDay = firstDate.getDay(); // 0 = Sunday, 1 = Monday...
    
    let currentWeek: ({ date: string; count: number } | null)[] = [];
    
    // Add padding for days before Jan 1
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }
    
    data.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Push last partial week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
  }

  // Helper to determine if a week needs extra margin (end of month)
  const getWeekClass = (index: number) => {
    // If it's the last week, no margin needed
    if (index === weeks.length - 1) return "";
    
    const currentWeekStart = weeks[index].find(d => d !== null);
    const nextWeekStart = weeks[index + 1]?.find(d => d !== null);
    
    if (currentWeekStart && nextWeekStart) {
        const currMonth = new Date(currentWeekStart.date).getMonth();
        const nextMonth = new Date(nextWeekStart.date).getMonth();
        // If month changes between this week and next, add margin
        if (currMonth !== nextMonth) return "mr-3";
    }
    return "";
  };

  // Calculate month labels positions using a flex row that mirrors the grid
  const MonthLabels = () => {
    return (
      <div className="flex gap-1 min-w-max">
        {/* Placeholder for day labels column */}
        <div className="w-8 shrink-0"></div> 
        
        {weeks.map((week, index) => {
          // Find first actual date in this week
          const firstDateObj = week.find(d => d !== null);
          if (!firstDateObj) return <div key={index} className={`w-3 h-6 ${getWeekClass(index)}`} />;

          const dateObj = new Date(firstDateObj.date);
          const currentMonth = dateObj.toLocaleString('default', { month: 'short' });
          
          // Logic: Show label if this is the first week where this month appears
          let showLabel = false;
          if (index === 0) {
            showLabel = true;
          } else {
             const prevWeek = weeks[index-1];
             const firstDateInPrevWeek = prevWeek.find(d => d !== null);
             if (firstDateInPrevWeek) {
                 const prevMonth = new Date(firstDateInPrevWeek.date).toLocaleString('default', { month: 'short' });
                 if (currentMonth !== prevMonth) showLabel = true;
             }
          }

          return (
            <div key={index} className={`w-3 h-6 relative overflow-visible ${getWeekClass(index)}`}>
              {showLabel && (
                 <span className="text-[10px] text-muted-foreground absolute bottom-1 left-0 font-medium whitespace-nowrap">
                   {currentMonth}
                 </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Activity Overview ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <MonthLabels />
            <div className="flex gap-1">
               {/* Day labels column */}
               <div className="flex flex-col gap-1 w-8 justify-between pb-1 pt-1 pr-1 text-[10px] text-muted-foreground leading-none">
                  <span className="opacity-0">Sun</span>
                  <span>Mon</span>
                  <span className="opacity-0">Tue</span>
                  <span>Wed</span>
                  <span className="opacity-0">Thu</span>
                  <span>Fri</span>
                  <span className="opacity-0">Sat</span>
               </div>
               
               {/* Grid */}
               <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className={`flex flex-col gap-1 ${getWeekClass(weekIndex)}`}>
                    {week.map((day, dayIndex) => (
                      day ? (
                        <HeatmapCell key={day.date} count={day.count} date={day.date} />
                      ) : (
                        <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3 bg-transparent" />
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end mt-4 gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="heatmap-cell heatmap-level-0" />
              <div className="heatmap-cell heatmap-level-1" />
              <div className="heatmap-cell heatmap-level-2" />
              <div className="heatmap-cell heatmap-level-3" />
              <div className="heatmap-cell heatmap-level-4" />
              <div className="heatmap-cell heatmap-level-5" />
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface HabitCardProps {
  habit: Habit;
  onLog: (id: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

function HabitCard({ habit, onLog, onEdit, onDelete }: HabitCardProps) {
  const [completed, setCompleted] = useState(habit.completedToday || false);
  const goal = habit.goal || 1;
  // Use real completion status effectively
  const progress = completed ? goal : 0; 
  const progressPercent = (progress / goal) * 100;
  
  useEffect(() => {
    setCompleted(!!habit.completedToday);
  }, [habit.completedToday]);

  const handleLog = () => {
    // Optimistic update
    const newCompleted = !completed;
    setCompleted(newCompleted);
    onLog(habit._id, newCompleted);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleLog}
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all",
            completed
              ? "bg-success text-success-foreground"
              : "border-2 border-dashed hover:border-primary hover:bg-primary/5"
          )}
          style={{ 
            borderColor: completed ? undefined : habit.color,
            backgroundColor: completed ? undefined : habit.color ? `${habit.color}14` : undefined
          }}
        >
          {completed ? (
            <Check className="h-6 w-6" />
          ) : (
            <Target className="h-5 w-5" style={{ color: habit.color }} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-sm">{habit.name}</h3>
              {habit.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(habit._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {goal > 1 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{progress}/{goal}</span>
                <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-xs">
              <Flame className="h-3.5 w-3.5 text-warning" />
              <span className="font-medium">{habit.currentStreak || 0}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Best: {habit.longestStreak || 0}</span>
            </div>
            {habit.reminderTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{habit.reminderTime}</span>
              </div>
            )}
            {habit.sharedWith && habit.sharedWith.length > 0 && (
              <Badge variant="secondary" className="text-2xs">Shared</Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      // Only fetch active habits and pass local date to check completion status against TODAY in user's timezone
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const data = await habitsApi.getHabits({ isActive: true, date: todayStr });
      setHabits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (id: string, completed: boolean) => {
    try {
      // Use local date for consistency with heatmap and "completedToday" checks
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      await habitsApi.logHabitCompletion(id, {
        date: `${year}-${month}-${day}`,
        completed
      });
      toast.success('Habit logged!');
      // Reload to get updated streak and heatmap
      loadHabits();
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to log habit:', error);
      toast.error('Failed to log habit');
    }
  };

  const handleEdit = (habit: Habit) => {
    setSelectedHabit(habit);
    setDialogOpen(true);
  };

  const handleCreateHabit = () => {
    setSelectedHabit(null);
    setDialogOpen(true);
  };

  const handleSaveHabit = async (data: HabitCreate | HabitUpdate) => {
    try {
      if (selectedHabit) {
        // Update existing habit
        await habitsApi.updateHabit(selectedHabit._id, data as HabitUpdate);
        toast.success('Habit updated!');
      } else {
        // Create new habit
        await habitsApi.createHabit(data as HabitCreate);
        toast.success('Habit created!');
      }
      loadHabits();
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save habit:', error);
      toast.error('Failed to save habit');
    }
  };

  const handleDelete = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h._id !== id));
    
    try {
      await habitsApi.deleteHabit(id);
      toast.success('Habit archived');
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit');
      loadHabits();
    }
  };

  // Summary stats
  const totalCompletions = habits.reduce((acc, h) => acc + (h.totalCompletions || 0), 0);
  const longestStreak = Math.max(...habits.map((h) => h.longestStreak || 0), 0);
  const activeToday = habits.filter(h => h.completedToday).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Habits"
        description="Build lasting habits, one day at a time"
        actions={
          <Button onClick={handleCreateHabit} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            New Habit
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeToday}/{habits.length}</p>
              <p className="text-xs text-muted-foreground">Completed today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">Longest streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Total completions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <div className="mb-6">
        <ActivityHeatmap refreshTrigger={statsRefreshTrigger} />
      </div>

      {/* Habits List */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Today's Habits</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onLog={handleLog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Habit Dialog */}
      <HabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={selectedHabit}
        onSave={handleSaveHabit}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Target,
  StickyNote,
  Users,
  TrendingUp,
  TrendingDown,
  Flame,
  Calendar,
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Award,
  Activity,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/skeleton-loaders';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  ComposedChart
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import * as analyticsApi from '@/lib/api/analytics';
import * as tasksApi from '@/lib/api/tasks';
import * as notesApi from '@/lib/api/notes';
import * as habitsApi from '@/lib/api/habits';
import { toast } from 'sonner';
import type { AnalyticsSummary, SocialFeedItem, Task, Note, Habit, StreakInfo } from '@/types/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper to format relative time
const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Colors for charts
const COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [activity, setActivity] = useState<SocialFeedItem[]>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; tasks: number; habits: number; notes: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ week: string; completed: number; pending: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds to catch updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]); // Reload data when time range changes

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [analyticsData, feedData, tasksData, notesData, habitsData] = await Promise.all([
        analyticsApi.getAnalyticsSummary().catch(() => null),
        analyticsApi.getSocialFeed().catch(() => ({ feed: [], total: 0 })),
        tasksApi.getTasks().catch(() => []),
        notesApi.getNotes().catch(() => []),
        habitsApi.getHabits().catch(() => [])
      ]);

      // Set raw data
      setStats(analyticsData);
      setActivity(feedData.feed || []);
      setTasks(tasksData || []);
      setNotes(notesData || []);
      setHabits(habitsData || []);

      // Generate chart data
      generateWeeklyData(tasksData || [], habitsData || [], notesData || []);
      generateMonthlyData(tasksData || []);
      generateCategoryData(habitsData || []);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Generate weekly chart data
  const generateWeeklyData = (tasks: Task[], habits: Habit[], notes: Note[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    if (timeRange === 'week') {
      // Weekly view: Show last 7 days individually
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0); // Reset time to start of day
        
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        
        const dayName = days[date.getDay()];
        
        // Count tasks completed on this specific day
        const tasksCount = tasks.filter((t: Task) => {
          if (!t.updatedAt || t.status !== 'done') return false;
          const taskDate = new Date(t.updatedAt);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === date.getTime();
        }).length;

        // Count notes created on this day
        const notesCount = notes.filter((n: Note) => {
          if (!n.createdAt) return false;
          const noteDate = new Date(n.createdAt);
          noteDate.setHours(0, 0, 0, 0);
          return noteDate.getTime() === date.getTime();
        }).length;

        // Estimate habits for this day
        const activeHabitsOnDay = habits.filter((h: Habit) => {
          if (!h.isActive) return false;
          if (h.createdAt) {
            const habitCreated = new Date(h.createdAt);
            habitCreated.setHours(0, 0, 0, 0);
            return habitCreated.getTime() <= date.getTime();
          }
          return true;
        }).length;
        
        const estimatedCompletionRate = 0.6 + Math.random() * 0.2;
        const habitsCount = Math.floor(activeHabitsOnDay * estimatedCompletionRate);

        console.log(`Weekly - ${dayName} (${date.toLocaleDateString()}):`, {
          tasksCount,
          notesCount,
          habitsCount,
          date: date.toISOString()
        });

        weekData.push({
          day: dayName,
          tasks: tasksCount,
          habits: habitsCount,
          notes: notesCount
        });
      }
    } else {
      // Month/Year view: Group days together
      const daysCount = timeRange === 'month' ? 30 : 365;
      const groupSize = timeRange === 'month' ? 5 : 30;
      const numPeriods = Math.ceil(daysCount / groupSize);

      for (let periodIndex = numPeriods - 1; periodIndex >= 0; periodIndex--) {
        const daysFromToday = periodIndex * groupSize;
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysFromToday - (groupSize - 1));
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - daysFromToday);
        endDate.setHours(23, 59, 59, 999);
        
        let label = '';
        if (timeRange === 'month') {
          // Show date for end of period
          label = `${endDate.getDate()}`;
        } else {
          // Show month name
          label = endDate.toLocaleDateString('en-US', { month: 'short' });
        }
        
        // Count tasks completed in this period
        const tasksCount = tasks.filter((t: Task) => {
          if (!t.updatedAt || t.status !== 'done') return false;
          const taskDate = new Date(t.updatedAt);
          return taskDate >= startDate && taskDate <= endDate;
        }).length;

        // Count notes created in this period
        const notesCount = notes.filter((n: Note) => {
          if (!n.createdAt) return false;
          const noteDate = new Date(n.createdAt);
          return noteDate >= startDate && noteDate <= endDate;
        }).length;

        // Estimate habits for this period
        const activeHabitsInPeriod = habits.filter((h: Habit) => {
          if (!h.isActive) return false;
          if (h.createdAt) {
            const habitCreated = new Date(h.createdAt);
            return habitCreated <= endDate;
          }
          return true;
        }).length;
        
        const estimatedCompletionRate = 0.6 + Math.random() * 0.2;
        const habitsCount = Math.floor(activeHabitsInPeriod * estimatedCompletionRate * groupSize);

        console.log(`${timeRange === 'month' ? 'Monthly' : 'Yearly'} - Period ${label}:`, {
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          tasksCount,
          notesCount,
          habitsCount
        });

        weekData.push({
          day: label,
          tasks: tasksCount,
          habits: habitsCount,
          notes: notesCount
        });
      }
    }

    setWeeklyData(weekData);
  };

  // Generate monthly trend data
  const generateMonthlyData = (tasks: Task[]) => {
    const monthData = [];
    const today = new Date();
    
    // Determine periods based on time range
    const periods = timeRange === 'week' ? 4 : timeRange === 'month' ? 4 : 12;
    const daysPerPeriod = timeRange === 'week' ? 7 : timeRange === 'month' ? 7 : 30;
    
    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = new Date(today);
      periodStart.setDate(periodStart.getDate() - (i * daysPerPeriod));
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + daysPerPeriod);
      
      const completed = tasks.filter((t: Task) => {
        if (!t.updatedAt || t.status !== 'done') return false;
        const taskDate = new Date(t.updatedAt);
        return taskDate >= periodStart && taskDate < periodEnd;
      }).length;

      const pending = tasks.filter((t: Task) => {
        if (!t.createdAt || t.status === 'done') return false;
        const taskDate = new Date(t.createdAt);
        return taskDate >= periodStart && taskDate < periodEnd;
      }).length;

      let label = '';
      if (timeRange === 'week') {
        label = `Day ${(periods - i) * 2}`;
      } else if (timeRange === 'month') {
        label = `Week ${periods - i}`;
      } else {
        label = periodStart.toLocaleDateString('en-US', { month: 'short' });
      }

      monthData.push({
        week: label,
        completed,
        pending
      });
    }

    setMonthlyData(monthData);
  };

  // Generate category breakdown
  const generateCategoryData = (habits: Habit[]) => {
    const categories: Record<string, number> = {};
    
    habits.forEach((h: Habit) => {
      const cat = h.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const data = Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    setCategoryData(data);
  };

  // Calculate advanced stats based on selected time range
  const getTimeRangeDates = () => {
    const today = new Date();
    const startDate = new Date(today);
    
    if (timeRange === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(today.getDate() - 30);
    } else {
      startDate.setDate(today.getDate() - 365);
    }
    
    return { startDate, endDate: today };
  };

  const { startDate } = getTimeRangeDates();

  // Tasks completed in selected time range
  const tasksCompletedInRange = tasks.filter((t) => {
    if (!t.updatedAt || t.status !== 'done') return false;
    const taskDate = new Date(t.updatedAt);
    return taskDate >= startDate;
  }).length;

  const tasksCompletedToday = tasks.filter((t) => {
    if (!t.updatedAt || t.status !== 'done') return false;
    const taskDate = new Date(t.updatedAt);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  }).length;

  const tasksCompletedYesterday = tasks.filter((t) => {
    if (!t.updatedAt || t.status !== 'done') return false;
    const taskDate = new Date(t.updatedAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return taskDate.toDateString() === yesterday.toDateString();
  }).length;

  const taskTrend = tasksCompletedYesterday === 0 ? 0 : 
    ((tasksCompletedToday - tasksCompletedYesterday) / tasksCompletedYesterday) * 100;

  const activeHabitsCount = habits.filter((h) => h.isActive).length;
  const totalHabits = habits.length;
  const habitCompletionRate = totalHabits === 0 ? 0 : (activeHabitsCount / totalHabits) * 100;

  const topStreak = stats?.topStreaks?.[0]?.currentStreak || 0;
  const avgStreak = stats?.averageStreak || 0;
  const notesCount = notes.length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  const statCards = [
    { 
      label: timeRange === 'week' ? 'Tasks This Week' : timeRange === 'month' ? 'Tasks This Month' : 'Tasks This Year',
      value: tasksCompletedInRange, 
      icon: CheckSquare, 
      trend: taskTrend,
      trendLabel: `${Math.abs(taskTrend).toFixed(0)}% vs yesterday`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      total: `${completedTasks}/${totalTasks} total`
    },
    { 
      label: 'Active Habits', 
      value: activeHabitsCount, 
      icon: Target, 
      trend: habitCompletionRate - 50,
      trendLabel: `${habitCompletionRate.toFixed(0)}% active rate`,
      color: 'text-success',
      bgColor: 'bg-success/10',
      total: `${totalHabits} total habits`
    },
    { 
      label: 'Best Streak', 
      value: topStreak, 
      icon: Flame, 
      trend: topStreak - avgStreak,
      trendLabel: `${avgStreak.toFixed(0)} avg streak`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      total: 'days in a row'
    },
    { 
      label: 'Total Notes', 
      value: notesCount, 
      icon: StickyNote, 
      trend: notesCount > 0 ? 15 : 0,
      trendLabel: `${stats?.totalCompletions || 0} completions`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      total: 'knowledge base'
    },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Dashboard"
          description="Your productivity analytics"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Dashboard"
        description="Your productivity analytics and insights"
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadDashboardData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="week" disabled={loading}>
                  {loading && timeRange === 'week' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" disabled={loading}>
                  {loading && timeRange === 'month' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Month
                </TabsTrigger>
                <TabsTrigger value="year" disabled={loading}>
                  {loading && timeRange === 'year' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Advanced Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: stat.color.replace('text-', 'hsl(var(--') + '))' }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      {stat.trend !== 0 && (
                        <Badge variant={stat.trend > 0 ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                          {stat.trend > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(stat.trend).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-4xl font-bold mb-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.trendLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">{stat.total}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} shrink-0`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-4">
                  <Progress 
                    value={stat.label.includes('Tasks') ? taskCompletionRate : 
                           stat.label.includes('Habits') ? habitCompletionRate : 
                           stat.label.includes('Streak') ? (topStreak / 30) * 100 : 
                           50} 
                    className="h-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Charts Grid */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Activity
                  </CardTitle>
                  <CardDescription>
                    Tasks, habits, and notes over the last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : 'year'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fill="url(#colorTasks)"
                      name="Tasks"
                    />
                    <Area
                      type="monotone"
                      dataKey="habits"
                      stroke={COLORS.success}
                      strokeWidth={2}
                      fill="url(#colorHabits)"
                      name="Habits"
                    />
                    <Bar dataKey="notes" fill={COLORS.warning} radius={[4, 4, 0, 0]} name="Notes" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Habit Categories - Takes 1 column */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Habit Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No habits yet</p>
                      <p className="text-xs mt-1">Create habits to see category breakdown</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Charts Row */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Weekly' : 'Monthly'} Trends
              </CardTitle>
              <CardDescription>
                Task completion over the {timeRange === 'week' ? 'last week' : timeRange === 'month' ? 'last month' : 'last year'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill={COLORS.success} radius={[4, 4, 0, 0]} name="Completed" />
                    <Bar dataKey="pending" fill={COLORS.warning} radius={[4, 4, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Habit Streaks</CardTitle>
              <CardDescription>Your best performing habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topStreaks && stats.topStreaks.length > 0 ? (
                  stats.topStreaks.slice(0, 5).map((streak, index) => (
                    <motion.div
                      key={streak.habitId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{streak.habitName}</p>
                        <p className="text-xs text-muted-foreground">
                          Longest: {streak.longestStreak} days
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-warning" />
                        <span className="text-lg font-bold">{streak.currentStreak}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No active streaks</p>
                    <p className="text-xs mt-1">Complete habits daily to build streaks!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Social Feed</CardTitle>
              <CardDescription>Recent activity from accountability partners</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm mt-2">Share habits with friends to see their progress here!</p>
                  <Button variant="outline" className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Share a Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activity.map((item, index) => (
                    <motion.div
                      key={`${item.userId}-${item.completedAt}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                    >
                      <div className="p-2.5 rounded-full bg-success/10 text-success">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          <span className="font-semibold text-primary">{item.userName}</span>{' '}
                          completed <span className="font-semibold">{item.habitName}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {item.streak > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Flame className="h-3 w-3" />
                              {item.streak} day streak
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(item.completedAt.toString())}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
              <CardDescription>Overview at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Completion Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Task Completion</span>
                    <span className="text-sm font-bold">{taskCompletionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={taskCompletionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedTasks} of {totalTasks} tasks done
                  </p>
                </div>

                {/* Habit Activity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Habit Activity</span>
                    <span className="text-sm font-bold">{habitCompletionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={habitCompletionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeHabitsCount} of {totalHabits} habits active
                  </p>
                </div>

                {/* Weekly Summary */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">This Week</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          <CheckSquare className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm">Tasks</span>
                      </div>
                      <span className="text-sm font-bold">{weeklyData.reduce((sum, d) => sum + d.tasks, 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-success/10 text-success">
                          <Target className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm">Habits</span>
                      </div>
                      <span className="text-sm font-bold">{weeklyData.reduce((sum, d) => sum + d.habits, 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-warning/10 text-warning">
                          <StickyNote className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm">Notes</span>
                      </div>
                      <span className="text-sm font-bold">{weeklyData.reduce((sum, d) => sum + d.notes, 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">💡 Insight</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {taskCompletionRate > 75 
                      ? "Great job! You're crushing your tasks this week! 🎉"
                      : taskCompletionRate > 50
                      ? "Keep it up! You're making steady progress. 💪"
                      : "Time to focus! Let's knock out some tasks today. 🚀"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

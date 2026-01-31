import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Users, 
  Zap, 
  Layout, 
  Target,
  Flame,
  BarChart3,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex flex-col min-h-screen w-full bg-background font-sans text-foreground overflow-x-hidden antialiased selection:bg-primary/20 selection:text-primary">
            {/* Sticky Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4 max-w-[1200px] mx-auto w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
                            <CheckSquare className="size-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">TaskFlow</h2>
                    </div>
                    
                    {/* Desktop Nav & Actions */}
                    <div className="flex items-center gap-8">
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
                            <a href="#habits" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Habits</a>
                            <a href="#analytics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Analytics</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>
                            <Button 
                                variant="ghost" 
                                onClick={() => navigate('/login')}
                                className="hidden sm:flex"
                            >
                                Login
                            </Button>
                            <Button 
                                onClick={() => navigate('/register')}
                                className="font-bold shadow-lg shadow-primary/20"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center w-full">
                {/* Hero Section */}
                <section className="w-full px-6 py-20 md:py-32 max-w-[1200px]">
                    <div className="flex flex-col items-center text-center gap-8">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            New: Advanced Habit Tracking with Heatmaps
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter max-w-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Master your Tasks.<br/>
                            Build lasting <span className="text-primary">Habits.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            The all-in-one workspace that combines powerful project management with advanced habit tracking. 
                            Visualize your progress with GitHub-style heatmaps and stay consistent.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                            <Button 
                                size="lg" 
                                onClick={() => navigate('/register')}
                                className="h-12 px-8 text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                            >
                                Start for Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg"
                                className="h-12 px-8 text-base hover:bg-muted"
                            >
                                View Demo
                            </Button>
                        </div>

                        {/* Hero Image / Dashboard Preview */}
                        <div className="mt-16 w-full max-w-5xl rounded-xl border bg-card p-2 shadow-2xl">
                            <div className="rounded-lg bg-muted/50 aspect-video w-full flex items-center justify-center overflow-hidden relative">
                                {/* Abstract UI Representation */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-background"></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 w-full h-full opacity-90">
                                    {/* Sidebar */}
                                    <div className="hidden md:flex flex-col gap-4 border-r pr-6">
                                        <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
                                        <div className="space-y-3 mt-4">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="size-4 rounded bg-muted"></div>
                                                    <div className="h-4 w-full bg-muted rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Main Content */}
                                    <div className="col-span-2 flex flex-col gap-6">
                                        {/* Header */}
                                        <div className="flex justify-between">
                                            <div className="h-8 w-48 bg-muted rounded"></div>
                                            <div className="h-8 w-20 bg-primary/20 rounded"></div>
                                        </div>
                                        {/* Heatmap Mockup */}
                                        <div className="p-4 rounded-lg border bg-background space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="h-4 w-32 bg-muted rounded"></div>
                                                <div className="h-4 w-16 bg-muted rounded"></div>
                                            </div>
                                            <div className="flex gap-1 flex-wrap">
                                                {Array.from({ length: 90 }).map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`size-3 rounded-sm ${
                                                            Math.random() > 0.7 ? 'bg-primary' : 
                                                            Math.random() > 0.4 ? 'bg-primary/40' : 'bg-muted'
                                                        }`}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Task Cards */}
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-16 w-full rounded-lg border bg-background p-3 flex items-center gap-4">
                                                    <div className="size-5 rounded-full border-2 border-muted"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 w-3/4 bg-muted rounded"></div>
                                                        <div className="h-2 w-1/2 bg-muted/50 rounded"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Grid */}
                <section id="features" className="w-full py-24 bg-muted/30 border-y">
                    <div className="w-full max-w-[1200px] px-6 mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to succeed</h2>
                            <p className="text-xl text-muted-foreground">Powerhouse features packed into a simple, intuitive interface.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="group p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Target className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Goal-Oriented Tasks</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Break down big goals into manageable steps. Set priorities, due dates, and tags to keep everything organized.
                                </p>
                            </div>

                            {/* Feature 2: Habits (Highlighted) */}
                            <div className="group p-8 rounded-2xl bg-background border border-primary/20 hover:border-primary transition-all hover:shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    NEW
                                </div>
                                <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Flame className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Habit Streaks</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Build consistency with streak tracking. Don't break the chain and watch your productivity soar.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Layout className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Visual Notes</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Capture ideas with rich text notes. Pin important info and organize with folders just like your tasks.
                                </p>
                            </div>

                             {/* Feature 4: Heatmap */}
                             <div className="group p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="size-12 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Calendar className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Activity Heatmap</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Visualize your daily contributions with a GitHub-style calendar view. See your entire year at a glance.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="size-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Understand your working patterns with detailed charts comparing completion rates and focus times.
                                </p>
                            </div>

                             {/* Feature 6 */}
                             <div className="group p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="size-12 rounded-lg bg-teal-100 dark:bg-teal-900/20 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Collaborate</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Share habits and tasks with accountability partners. View friends' progress in your social feed.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Secure & Reliable */}
                <section className="w-full py-24 bg-background">
                    <div className="w-full max-w-[1200px] px-6 mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-12 bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center gap-2 text-primary font-medium">
                                    <ShieldCheck className="size-5" />
                                    <span>Enterprise Grade Security</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Your data is safe with us.</h3>
                                <p className="text-muted-foreground text-lg">
                                    We use industry-standard encryption, dual-token authentication, and secure session management to ensure your privacy is never compromised.
                                </p>
                                <ul className="space-y-3">
                                    {['Argon2 Password Hashing', 'Secure Session Management', 'Device Tracking & Alerts'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="size-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                                                <CheckSquare className="size-3.5" />
                                            </div>
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full flex justify-center">
                                <div className="relative size-64 md:size-80 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                                    <ShieldCheck className="size-32 text-primary/40" />
                                    <div className="absolute inset-0 border border-primary/20 rounded-full scale-110"></div>
                                    <div className="absolute inset-0 border border-primary/10 rounded-full scale-125"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                {/* CTA Section */}
                <section className="w-full py-24 bg-gradient-auth relative overflow-hidden border-t">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                    <div className="w-full max-w-[800px] px-6 mx-auto text-center relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Ready to boost your productivity?</h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands of users who are getting more done, every single day.
                        </p>
                        <Button 
                            size="lg"
                            onClick={() => navigate('/register')}
                            className="h-14 px-8 text-lg font-bold shadow-2xl hover:scale-105 transition-transform"
                        >
                            Start Your Journey
                        </Button>
                        <p className="text-sm text-muted-foreground/60">No credit card required. Free forever plan available.</p>
                    </div>
                </section>
            </main>
            
            {/* Footer */}
            <footer className="w-full border-t bg-muted/20">
                <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="size-6 text-primary" />
                        <span className="font-bold text-lg">TaskFlow</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="https://github.com/mirza-shafi" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                    </div>
                    <p className="text-sm text-muted-foreground">© 2026 TaskFlow Inc.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

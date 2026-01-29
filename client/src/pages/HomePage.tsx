import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white overflow-x-hidden antialiased selection:bg-primary/20 selection:text-primary">
            {/* Sticky Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-[#e7edf3] dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4 max-w-[1200px] mx-auto w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-2xl">check_box</span>
                        </div>
                        <h2 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight tracking-tight">TaskFlow</h2>
                    </div>
                    {/* Desktop Nav & Actions */}
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6">
                            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer">Features</a>
                            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer">Pricing</a>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => navigate('/login')}
                                className="hidden sm:flex items-center justify-center rounded-lg h-9 px-4 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold transition-colors"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => navigate('/register')}
                                className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-sm shadow-blue-500/30 transition-all transform hover:scale-105"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center w-full">
                {/* Hero Section */}
                <section className="w-full px-6 py-16 md:py-24 max-w-[1200px]">
                    <div className="@container">
                        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
                            {/* Text Content */}
                            <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                                    Mastering your day,<br className="hidden lg:block"/> one task at a time.
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                                    The ultimate workspace blending powerful task management with intuitive visual note-taking. Stay organized without the clutter.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
                                    <button 
                                        onClick={() => navigate('/register')}
                                        className="h-12 px-8 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
                                    >
                                        Try for Free
                                    </button>
                                    <button className="h-12 px-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-700 dark:text-slate-200 font-medium text-base transition-colors w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer">
                                        <span className="material-symbols-outlined text-lg">play_circle</span>
                                        See how it works
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500 mt-2">
                                    <span className="material-symbols-outlined text-lg text-green-500">check_circle</span>
                                    <span>No credit card required</span>
                                </div>
                            </div>
                            {/* Hero Image */}
                            <div className="flex-1 w-full max-w-[600px] lg:max-w-none perspective-1000">
                                <div className="relative group rounded-xl bg-white dark:bg-slate-800 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 transform transition-transform duration-500 hover:scale-[1.01] hover:rotate-1">
                                    {/* Mockup Header */}
                                    <div className="h-6 w-full bg-slate-50 dark:bg-slate-900 rounded-t-lg flex items-center gap-1.5 px-3 border-b border-slate-100 dark:border-slate-700">
                                        <div className="size-2.5 rounded-full bg-red-400"></div>
                                        <div className="size-2.5 rounded-full bg-yellow-400"></div>
                                        <div className="size-2.5 rounded-full bg-green-400"></div>
                                    </div>
                                    {/* Screenshot */}
                                    <div 
                                        className="w-full aspect-[4/3] bg-cover bg-center rounded-b-lg overflow-hidden" 
                                        style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCY5W8Gb84mA0PU4jj6jGENucKkQOYpiNVKM3cRs5hS6-_QZ9qiegfRxloxrevvoko_4b0cmjXoV8Lus7HgU1HuWI24ZX6LzlbC1C23EHHvKNm_gh2mijn4C9v0vdIedRMc6KN8a8wjC2MBnCGtP_9OTu5tuw1cx1Aie5vyuqbrV9iQHgcb_SG6nOTcGlGvxrue3jnLihQR3FrfooV-l6Gr8dJmZ_zGfHyzwXrlFH1Vzfqe_UgJmupw3lnFDK4E4Gi3ToA7X2pj')"}}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                                    </div>
                                    {/* Floating Element Example */}
                                    <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 hidden md:flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full">
                                            <span className="material-symbols-outlined">check</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-medium">Status</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">All tasks completed!</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section className="w-full bg-white dark:bg-slate-900 py-20 border-y border-slate-100 dark:border-slate-800">
                    <div className="w-full max-w-[1200px] px-6 mx-auto flex flex-col gap-12">
                        <div className="flex flex-col gap-4 text-center items-center">
                            <span className="text-primary font-bold text-sm tracking-widest uppercase">Features</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white max-w-2xl">
                                Why choose TaskFlow?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                                Everything you need to organize your life and work, centralized in one beautiful interface.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1 group">
                                <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">format_list_bulleted</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smart Lists</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Organize tasks automatically based on priority, tags, and due dates so you never miss a deadline.
                                    </p>
                                </div>
                            </div>
                            {/* Card 2 */}
                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1 group">
                                <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">calendar_month</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calendar Sync</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Seamlessly integrate with Google Calendar and Outlook to view your schedule alongside your to-dos.
                                    </p>
                                </div>
                            </div>
                            {/* Card 3 */}
                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1 group">
                                <div className="size-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">edit_note</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Visual Notes</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Capture ideas quickly with color-coded, sticky-style notes that help you visualize your thoughts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Testimonial / Social Proof */}
                <section className="w-full py-16 px-6 max-w-[1200px]">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-primary/10">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500">
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                "TaskFlow completely transformed how I manage my freelance projects. The visual notes are a game changer!"
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <div 
                                    className="size-10 rounded-full bg-slate-300 bg-cover bg-center" 
                                    style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBjyR1Rxx9e9yCPu6onElRWU7hLCMEOjNUAVfSk8JRnLT_Lyjd08DMoOmCuBh1phAXG0HG0hFE17HLNcdkV1h2NqPR__eMq0VJXlHWNwgQlp-gd6VIS7ufyOXwZPpfiTJ-1y-1xSjuAe7DZCRL7sBDetREqeYQ2meRgyQVUBy9oN-UGl2Y2d5NdSTJqwaB1Mz5rV5btwQzOvoZ8gD_hgUKERqna_X_FitJHhvu9FVYmpgB9X-F9Mt3H2LeB8MvEesf2E8_StV2')"}}
                                ></div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Sarah Jenkins</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Product Designer</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-32 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
                            <h4 className="font-bold text-slate-900 dark:text-white">Get organized today</h4>
                            <p className="text-slate-500 text-sm">Join 50,000+ users mastering their productivity.</p>
                            <form className="flex gap-2 w-full max-w-sm mx-auto md:mx-0">
                                <input className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" type="email" placeholder="Enter your email" />
                                <button type="button" className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors" onClick={() => navigate('/register')}>Start</button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Footer */}
            <footer className="w-full border-t border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
                <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">check_box</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-white">TaskFlow</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors">Privacy Policy</a>
                            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors">Terms of Service</a>
                            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors">Support</a>
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-400 text-sm">© 2026 TaskFlow Inc. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="#" className="size-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-xl">public</span>
                            </a>
                            <a href="#" className="size-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-xl">work</span>
                            </a>
                            <a href="#" className="size-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-xl">groups</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

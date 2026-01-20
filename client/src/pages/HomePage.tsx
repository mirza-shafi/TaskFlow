import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiCalendar, FiTarget, FiSmartphone, FiLayout, FiClock } from 'react-icons/fi';
import './Home.css';
import heroMockup from '../assets/hero-mockup.png';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, 0.05, -0.01, 0.9] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <div className="logo-icon"><FiCheck /></div>
          TaskFlow
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <Link to="/login" className="btn-login">Log In</Link>
          <Link to="/register" className="btn-signup">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.span className="hero-tagline" variants={fadeIn}>
            Stay Focused. Get Organized.
          </motion.span>
          <motion.h1 className="hero-title" variants={fadeIn}>
            Work <span>Smarter</span>,<br />Not Harder.
          </motion.h1>
          <motion.p className="hero-description" variants={fadeIn}>
            The all-in-one task manager for high-achievers. Streamline your workflow with a powerful Kanban board, habit tracking, and seamless organization.
          </motion.p>
          <motion.div className="hero-btns" variants={fadeIn}>
            <Link to="/register" className="btn-signup">Start For Free</Link>
            <Link to="/login" className="btn-login">View Demo</Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img src={heroMockup} alt="TaskFlow App Mockup" className="hero-image" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Built for the way you work
        </motion.h2>

        <motion.div 
          className="feature-grid"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <FeatureCard 
            icon={<FiLayout />} 
            title="Kanban Board" 
            desc="Visualize your work and move tasks through stages with ease."
          />
          <FeatureCard 
            icon={<FiCalendar />} 
            title="Smart Scheduling" 
            desc="Plan your day, week, and month with integrated calendar views."
          />
          <FeatureCard 
            icon={<FiTarget />} 
            title="Habit Tracking" 
            desc="Build better routines and track your consistency over time."
          />
          <FeatureCard 
            icon={<FiClock />} 
            title="Pomodoro Timer" 
            desc="Stay focused with built-in productivity timers."
          />
          <FeatureCard 
            icon={<FiSmartphone />} 
            title="All Devices" 
            desc="Sync your tasks across web, mobile, and desktop effortlessly."
          />
          <FeatureCard 
            icon={<FiCheck />} 
            title="Deep Focus" 
            desc="Minimize distractions and focus on your top priorities."
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">TaskFlow</div>
        <div>© 2026 TaskFlow. Inspired by modern productivity.</div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <motion.div className="feature-card" variants={fadeIn}>
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </motion.div>
);

export default HomePage;

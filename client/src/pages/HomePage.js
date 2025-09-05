import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const pageAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  return (
    <motion.div
      className="home-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageAnimation}
      transition={pageAnimation.transition}
    >
      <motion.header 
        className="home-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="home-logo">TaskFlow</Link>
        <div className="home-nav-buttons">
          <Link to="/login" className="home-button home-login-button">Log In</Link>
          <Link to="/register" className="home-button home-signup-button">Sign Up</Link>
        </div>
      </motion.header>

      <main className="home-hero">
        <motion.div 
          className="home-glass-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.h1 
            className="home-main-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Organize Your Life, Achieve Your Goals.
          </motion.h1>
          <motion.p 
            className="home-sub-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Stop juggling tasks in your head. Start tracking your progress and find your focus with a simple, beautiful to-do list.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Link to="/register" className="home-cta-button">Get Started for Free</Link>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
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
  const styles = {
    page: {
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      textDecoration: 'none',
      color: 'white',
    },
    navButtons: {
      display: 'flex',
      gap: '15px',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '600',
    },
    loginButton: {
      background: 'transparent',
      color: 'white',
    },
    signupButton: {
      background: 'white',
      color: '#6A5ACD',
    },
    hero: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px',
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      padding: '50px 60px',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    mainHeading: {
      fontSize: '48px',
      fontWeight: 'bold',
      margin: 0,
      lineHeight: 1.2,
    },
    // ---- THIS IS THE CORRECTED STYLE ----
    subHeading: {
      fontSize: '20px',
      maxWidth: '600px',
      margin: '20px auto 30px auto',
      opacity: 0.9,
      textAlign: 'center',
    },
    // ------------------------------------
    ctaButton: {
      padding: '15px 35px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      fontSize: '18px',
      fontWeight: '600',
      background: 'white',
      color: '#6A5ACD',
    },
  };
  
  return (
    <motion.div
      style={styles.page}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageAnimation}
      transition={pageAnimation.transition}
    >
      <motion.header 
        style={styles.header}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" style={styles.logo}>TaskFlow</Link>
        <div style={styles.navButtons}>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/login" style={{...styles.button, ...styles.loginButton}}>Log In</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/register" style={{...styles.button, ...styles.signupButton}}>Sign Up</Link>
          </motion.div>
        </div>
      </motion.header>

      <main style={styles.hero}>
        <motion.div 
          style={styles.glassCard}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.h1 
            style={styles.mainHeading}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Organize Your Life, Achieve Your Goals.
          </motion.h1>
          <motion.p 
            style={styles.subHeading}
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
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/register" style={styles.ctaButton}>Get Started for Free</Link>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
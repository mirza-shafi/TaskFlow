import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      alert('Registration successful! Please log in to continue.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.glassCard}>
        <Link to="/" style={styles.backLink}>
          <BackIcon />
          <span>Home</span>
        </Link>
        
        <h2 style={styles.title}>Create an Account</h2>

        {/* THIS FORM SECTION WAS MISSING */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Register</button>
        </form>
        {/* END OF MISSING SECTION */}

        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.linkText}>
          Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { minHeight: '100vh', fontFamily: 'system-ui, Arial, sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  glassCard: { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', padding: '40px', width: '100%', maxWidth: '400px', color: 'white', position: 'relative' },
  backLink: { position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.3s ease' },
  title: { textAlign: 'center', marginBottom: '24px', fontSize: '28px', paddingTop: '20px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '16px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  error: { color: '#ffdddd', textAlign: 'center', marginTop: '12px', padding: '10px', background: 'rgba(255, 0, 0, 0.2)', borderRadius: '8px' },
  linkText: { textAlign: 'center', marginTop: '16px', color: 'rgba(255, 255, 255, 0.8)' },
  link: { color: 'white', fontWeight: '600' }
};
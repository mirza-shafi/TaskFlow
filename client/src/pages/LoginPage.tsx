import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowLeft, FiCheckSquare } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-back-link">
            <FiArrowLeft /> <span>Back</span>
          </Link>
          <div className="auth-logo">
            <FiCheckSquare />
            <span>TaskFlow</span>
          </div>
        </div>

        <div className="auth-body">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Log in to manage your professional tasks.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <FiMail />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FiLock />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="auth-error-msg">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <button className="auth-social-btn google" onClick={() => alert('Google login coming soon!')}>
            <FcGoogle /> <span>Continue with Google</span>
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .auth-card {
          background: white;
          width: 100%;
          max-width: 440px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .auth-header {
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
        }

        .auth-back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .auth-back-link:hover {
          color: #5c6bc0;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #5c6bc0;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .auth-body {
          padding: 2.5rem 2rem;
        }

        .auth-body h1 {
          font-size: 1.85rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .auth-subtitle {
          color: #64748b;
          text-align: center;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .input-with-icon input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: #5c6bc0;
          background: white;
          box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.1);
        }

        .auth-error-msg {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid #fee2e2;
        }

        .auth-submit-btn {
          background: #5c6bc0;
          color: white;
          border: none;
          padding: 0.85rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: #4a59a7;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: #94a3b8;
        }

        .auth-divider::before, .auth-divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .auth-divider span {
          padding: 0 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          border: 1px solid #e2e8f0;
          background: white;
          color: #1e293b;
        }

        .auth-social-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .auth-footer-text {
          margin-top: 1.5rem;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
        }

        .auth-footer-text a {
          color: #5c6bc0;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-footer-text a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

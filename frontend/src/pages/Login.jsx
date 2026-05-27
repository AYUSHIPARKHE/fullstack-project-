import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const { login, user, authError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in both email and password fields.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/products');
    }
  };

  return (
    <div className="flex-center fade-in" style={{ minHeight: '75vh', padding: '20px' }}>
      <div className="glass" style={{
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
            Welcome <span className="text-gradient">Back</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage your inventory portal</p>
        </div>

        {(localError || authError) && (
          <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            color: 'var(--accent-red)'
          }}>
            <FiAlertCircle size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                className="form-input"
                style={{ paddingLeft: '48px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '48px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

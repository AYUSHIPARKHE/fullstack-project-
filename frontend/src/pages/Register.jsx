import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

const Register = () => {
  const { register, user, authError, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!username || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all requested fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify.');
      return;
    }

    const result = await register(username, email, password);
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
            Get <span className="text-gradient">Started</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create your account to unlock CRUD access</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                id="username"
                placeholder="developer101"
                className="form-input"
                style={{ paddingLeft: '48px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

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

          <div className="form-group">
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
                placeholder="Min. 6 characters"
                className="form-input"
                style={{ paddingLeft: '48px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
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
                id="confirmPassword"
                placeholder="Re-type your password"
                className="form-input"
                style={{ paddingLeft: '48px' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'CREATING PROFILE...' : 'SIGN UP'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

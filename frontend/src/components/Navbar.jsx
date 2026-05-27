import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiPlusCircle, FiBox, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass" style={{
      margin: '20px auto',
      padding: '16px 32px',
      maxWidth: '1200px',
      width: 'calc(100% - 48px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      position: 'relative'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 0 10px rgba(var(--accent-blue-rgb), 0.5)'
        }}>
          Q
        </div>
        <span className="text-gradient" style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          letterSpacing: '1px'
        }}>
          QUANTUM
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user ? (
          <>
            <Link
              to="/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                color: isActive('/products') ? 'var(--accent-blue)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              <FiBox /> Products
            </Link>

            <Link
              to="/products/add"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                color: isActive('/products/add') ? 'var(--accent-blue)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              <FiPlusCircle /> Add Product
            </Link>

            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              fontSize: '0.9rem',
              border: 'var(--border-glow)'
            }}>
              <FiUser style={{ color: 'var(--accent-purple)' }} />
              {user.username}
            </span>

            <button
              onClick={handleLogoutClick}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`btn ${isActive('/login') ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`btn ${isActive('/register') ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

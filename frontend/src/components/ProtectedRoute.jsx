import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        gap: '16px'
      }}>
        <Spinner />
        <p style={{ color: 'var(--text-secondary)', letterSpacing: '1px' }}>VERIFYING SESSION...</p>
      </div>
    );
  }

  if (!user) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

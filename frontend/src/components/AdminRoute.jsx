import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;

  // Not logged in at all
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but NOT admin — show clear error instead of silent redirect
  if (user.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: 'Inter, sans-serif',
        background: '#f4f6fb',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Admin Access Required
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          You are logged in as <strong>{user.name}</strong> ({user.email}), but your
          account role is <code style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>{user.role}</code>.
        </p>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
          Only users with <code style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>admin</code> role can access this panel.
          Please update your role in the database or contact the site owner.
        </p>
        <Link to="/" style={{
          marginTop: '0.5rem',
          padding: '0.6rem 1.4rem',
          background: '#6366f1',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          ← Go Back to Store
        </Link>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

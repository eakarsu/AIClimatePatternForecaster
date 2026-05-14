import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import features from '../features';

function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🌍 Climate Forecaster</h2>
          <p>AI-Powered Climate Intelligence</p>
        </div>
        <nav className="sidebar-nav">
          <div
            className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="icon">📊</span>
            Dashboard
          </div>
          {features.map((f) => (
            <div
              key={f.key}
              className={`sidebar-item ${location.pathname === `/feature/${f.key}` ? 'active' : ''}`}
              onClick={() => navigate(`/feature/${f.key}`)}
            >
              <span className="icon">{f.icon}</span>
              {f.title}
            </div>
          ))}
          <div
            className={`sidebar-item ${location.pathname === '/notifications' ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
          >
            <span className="icon">🔔</span>
            Notifications
          </div>
          <div
            className={`sidebar-item ${location.pathname === '/webhooks' ? 'active' : ''}`}
            onClick={() => navigate('/webhooks')}
          >
            <span className="icon">🪝</span>
            Webhooks
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              ⏻
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;

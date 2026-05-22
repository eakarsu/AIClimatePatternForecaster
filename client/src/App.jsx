import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import ClimatePatterns from './pages/ClimatePatterns';
import Alerts from './pages/Alerts';
import AIAnalysis from './pages/AIAnalysis';
import Notifications from './pages/Notifications';
import CommunityRiskMatrix from './pages/CommunityRiskMatrix';
import Webhooks from './pages/Webhooks';
import Layout from './components/Layout';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) return null;

  const withLayout = (children) =>
    user ? <Layout user={user} onLogout={handleLogout}>{children}</Layout> : <Navigate to="/login" />;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="dark" />
      <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={withLayout(<Dashboard />)} />
        <Route path="/climate-patterns" element={withLayout(<ClimatePatterns />)} />
        <Route path="/alerts" element={withLayout(<Alerts />)} />
        <Route path="/ai-analysis" element={withLayout(<AIAnalysis />)} />
        <Route path="/notifications" element={withLayout(<Notifications />)} />
        <Route path="/community-risk-matrix" element={withLayout(<CommunityRiskMatrix />)} />
        <Route path="/webhooks" element={withLayout(<Webhooks />)} />
        <Route path="/feature/:featureKey" element={withLayout(<FeaturePage />)} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

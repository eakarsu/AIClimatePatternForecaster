import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import features from '../features';
import api from '../api';

const STAT_COLORS = {
  totalPatterns: 'var(--accent)',
  activeAlerts: 'var(--danger)',
  totalForecasts: 'var(--cyan)',
  totalAiAnalyses: 'var(--purple)',
};

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
      <span style={{ color: color || 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{value ?? '—'}</span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load per-feature counts
  useEffect(() => {
    features.forEach(async (f) => {
      try {
        const res = await api.get(f.apiPath);
        const count = Array.isArray(res.data) ? res.data.length : (res.data?.pagination?.total ?? res.data?.data?.length ?? 0);
        setCounts((prev) => ({ ...prev, [f.key]: count }));
      } catch {
        setCounts((prev) => ({ ...prev, [f.key]: 0 }));
      }
    });
  }, []);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.stats);
        setRecentAnalyses(res.data.recentAnalyses || []);
      } catch {
        // Dashboard stats endpoint may not be available yet
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Climate Intelligence Dashboard</h1>
        <p>AI-powered climate analysis across 15 critical domains — $400M climate services platform</p>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', padding: '0 24px' }}>
          <StatCard label="Climate Patterns" value={stats.totalPatterns} color={STAT_COLORS.totalPatterns} />
          <StatCard label="Active Alerts" value={stats.activeAlerts} color={STAT_COLORS.activeAlerts} />
          <StatCard label="Weather Forecasts" value={stats.totalForecasts} color={STAT_COLORS.totalForecasts} />
          <StatCard label="AI Analyses Run" value={stats.totalAiAnalyses} color={STAT_COLORS.totalAiAnalyses} />
        </div>
      )}

      {/* Recent AI Analyses */}
      {recentAnalyses.length > 0 && (
        <div style={{ margin: '0 24px 32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 600 }}>Recent AI Analyses</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {recentAnalyses.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{a.analysis_type}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation shortcuts */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <button onClick={() => navigate('/climate-patterns')}
          style={{ padding: '8px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Climate Patterns
        </button>
        <button onClick={() => navigate('/alerts')}
          style={{ padding: '8px 18px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Alerts
        </button>
        <button onClick={() => navigate('/ai-analysis')}
          style={{ padding: '8px 18px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          AI Analysis
        </button>
      </div>

      {/* Feature cards */}
      <div className="cards-grid">
        {features.map((f) => (
          <div
            key={f.key}
            className="feature-card"
            onClick={() => navigate(`/feature/${f.key}`)}
          >
            <div className="card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <div className="card-count">
              <span>{counts[f.key] ?? '...'}</span> records loaded
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

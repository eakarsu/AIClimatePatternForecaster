import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import features from '../features';
import api from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    features.forEach(async (f) => {
      try {
        const res = await api.get(f.apiPath);
        setCounts((prev) => ({ ...prev, [f.key]: res.data.length }));
      } catch {
        setCounts((prev) => ({ ...prev, [f.key]: 0 }));
      }
    });
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Climate Intelligence Dashboard</h1>
        <p>AI-powered climate analysis across 15 critical domains — $400M climate services platform</p>
      </div>
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

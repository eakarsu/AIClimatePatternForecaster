import React, { useState, useEffect } from 'react';
import api from '../api';

const SEVERITY_CONFIG = {
  Low: { color: 'var(--success)', bg: 'var(--success-bg)', icon: 'ℹ️' },
  Moderate: { color: 'var(--warning)', bg: 'var(--warning-bg)', icon: '⚠️' },
  High: { color: 'var(--danger)', bg: 'var(--danger-bg)', icon: '🔴' },
  Critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.15)', icon: '🚨' },
};

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterActive, setFilterActive] = useState('true');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ alert_type: '', severity: 'Moderate', region: '', message: '', description: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterActive !== '') params.active = filterActive;
      if (filterSeverity) params.severity = filterSeverity;
      const res = await api.get('/alerts', { params });
      if (Array.isArray(res.data)) {
        setAlerts(res.data);
      } else {
        setAlerts(res.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await api.delete(`/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/alerts', form);
      setShowForm(false);
      setForm({ alert_type: '', severity: 'Moderate', region: '', message: '', description: '', active: true });
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = alerts.filter(a => a.active).length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>Climate Alerts</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeCount} active alert{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          {showForm ? 'Cancel' : '+ New Alert'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
          <option value="">All Alerts</option>
          <option value="true">Active Only</option>
          <option value="false">Resolved Only</option>
        </select>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
          <option value="">All Severities</option>
          {['Low', 'Moderate', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={fetchAlerts}
          style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Apply
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>New Climate Alert</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Alert Type *</label>
              <input required value={form.alert_type} onChange={e => setForm(f => ({ ...f, alert_type: e.target.value }))}
                placeholder="e.g. Hurricane Warning"
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Severity *</label>
              <select required value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                {['Low', 'Moderate', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Region *</label>
              <input required value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active</label>
              <select value={String(form.active)} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                <option value="true">Active</option>
                <option value="false">Resolved</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Message *</label>
              <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={2}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" disabled={saving}
                style={{ padding: '10px 24px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Saving...' : 'Create Alert'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts list */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {alerts.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No alerts found.</div>
          )}
          {alerts.map(a => {
            const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.Moderate;
            return (
              <div key={a.id} style={{ background: 'var(--bg-card)', border: `1px solid ${a.active ? cfg.color : 'var(--border)'}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px', opacity: a.active ? 1 : 0.65 }}>
                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.alert_type}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                      {a.severity}
                    </span>
                    {!a.active && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                        Resolved
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                    Region: {a.region}
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '6px' }}>{a.message}</div>
                  {a.description && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>{a.description}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {a.active && (
                    <button onClick={() => handleResolve(a.id)}
                      style={{ padding: '6px 14px', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: '6px', color: 'var(--success)', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      Resolve
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)}
                    style={{ padding: '6px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Alerts;

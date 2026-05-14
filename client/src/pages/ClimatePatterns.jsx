import React, { useState, useEffect } from 'react';
import api from '../api';

const SEVERITY_COLORS = {
  Low: 'var(--success)',
  Moderate: 'var(--warning)',
  High: 'var(--danger)',
  Critical: 'var(--critical)',
};

function ClimatePatterns() {
  const [patterns, setPatterns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ region: '', severity: '' });
  const [form, setForm] = useState({
    region: '', pattern_type: '', name: '', severity: 'Moderate', description: '', start_date: '', end_date: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchPatterns = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await api.get('/climate-patterns', { params });
      // Support both paginated and raw array responses
      if (Array.isArray(res.data)) {
        setPatterns(res.data);
        setPagination({ page: 1, totalPages: 1, total: res.data.length });
      } else {
        setPatterns(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatterns(1); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selected) {
        await api.put(`/climate-patterns/${selected.id}`, form);
      } else {
        await api.post('/climate-patterns', form);
      }
      setShowForm(false);
      setSelected(null);
      setForm({ region: '', pattern_type: '', name: '', severity: 'Moderate', description: '', start_date: '', end_date: '' });
      fetchPatterns(pagination.page);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setSelected(p);
    setForm({
      region: p.region || '', pattern_type: p.pattern_type || '', name: p.name || '',
      severity: p.severity || 'Moderate', description: p.description || '',
      start_date: p.start_date || '', end_date: p.end_date || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this climate pattern?')) return;
    try {
      await api.delete(`/climate-patterns/${id}`);
      fetchPatterns(pagination.page);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>Climate Patterns</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {pagination.total} patterns tracked
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setShowForm(!showForm); }}
          style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          {showForm ? 'Cancel' : '+ New Pattern'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Filter by region..."
          value={filters.region}
          onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
          style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', width: '200px' }}
        />
        <select
          value={filters.severity}
          onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
          style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
        >
          <option value="">All Severities</option>
          {['Low', 'Moderate', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button
          onClick={() => fetchPatterns(1)}
          style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Apply
        </button>
        <button
          onClick={() => { setFilters({ region: '', severity: '' }); setTimeout(() => fetchPatterns(1), 0); }}
          style={{ padding: '8px 16px', background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>{selected ? 'Edit Pattern' : 'New Climate Pattern'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Region *</label>
              <input required value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pattern Type *</label>
              <input required value={form.pattern_type} onChange={e => setForm(f => ({ ...f, pattern_type: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Severity</label>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                {['Low', 'Moderate', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving}
                style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Saving...' : selected ? 'Update Pattern' : 'Create Pattern'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSelected(null); }}
                style={{ padding: '10px 24px', background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patterns list */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {patterns.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No climate patterns found.</div>
          )}
          {patterns.map(p => (
            <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name || p.pattern_type}</span>
                  {p.severity && (
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: `${SEVERITY_COLORS[p.severity]}22`, color: SEVERITY_COLORS[p.severity] || 'var(--text-secondary)' }}>
                      {p.severity}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                  {p.region} &bull; {p.pattern_type}
                  {p.start_date && ` • ${p.start_date}`}
                  {p.end_date && ` – ${p.end_date}`}
                </div>
                {p.description && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', maxWidth: '600px' }}>{p.description.slice(0, 120)}{p.description.length > 120 ? '...' : ''}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(p)}
                  style={{ padding: '6px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)}
                  style={{ padding: '6px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchPatterns(p)}
              style={{ padding: '6px 14px', background: p === pagination.page ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: p === pagination.page ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClimatePatterns;

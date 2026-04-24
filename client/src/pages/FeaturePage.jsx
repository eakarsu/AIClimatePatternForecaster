import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import features from '../features';
import api from '../api';

function FeaturePage() {
  const { featureKey } = useParams();
  const navigate = useNavigate();
  const feature = features.find((f) => f.key === featureKey);

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!feature) return;
    setLoading(true);
    try {
      const res = await api.get(feature.apiPath);
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    fetchItems();
    setSelected(null);
    setAiResult(null);
  }, [featureKey, fetchItems]);

  if (!feature) {
    return <div>Feature not found</div>;
  }

  const openCreate = () => {
    setEditItem(null);
    setFormData({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const data = {};
    feature.formFields.forEach((f) => {
      data[f.name] = item[f.name] ?? '';
    });
    setFormData(data);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`${feature.apiPath}/${editItem.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await api.post(feature.apiPath, formData);
        toast.success('Created successfully');
      }
      setShowModal(false);
      fetchItems();
      if (editItem && selected?.id === editItem.id) {
        const res = await api.get(`${feature.apiPath}/${editItem.id}`);
        setSelected(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${feature.title.slice(0, -1)}?`)) return;
    try {
      await api.delete(`${feature.apiPath}/${item.id}`);
      toast.success('Deleted successfully');
      if (selected?.id === item.id) setSelected(null);
      fetchItems();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const runAI = async (item) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await api.post(feature.aiEndpoint, {
        [feature.aiDataKey]: item,
      });
      setAiResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'AI analysis failed';
      toast.error(msg);
      setAiResult({ error: msg });
    } finally {
      setAiLoading(false);
    }
  };

  const getBadgeClass = (value) => {
    if (!value) return 'badge';
    const v = String(value).toLowerCase();
    if (['critical', 'extreme', 'hazardous', 'very unhealthy'].includes(v)) return 'badge badge-critical';
    if (['high', 'unhealthy', 'category 4', 'category 5', 'super typhoon', 'severe'].includes(v)) return 'badge badge-high';
    if (['moderate', 'unhealthy for sensitive', 'category 2', 'category 3'].includes(v)) return 'badge badge-moderate';
    return 'badge badge-low';
  };

  const formatColumnValue = (col, val) => {
    if (val === null || val === undefined) return '—';
    if (col === 'active') return val ? 'Active' : 'Inactive';
    if (typeof val === 'number' && col.includes('amount')) return val.toLocaleString();
    if (typeof val === 'number' && col.includes('population')) return val.toLocaleString();
    return String(val);
  };

  const formatColHeader = (col) => {
    return col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderDataSection = (data) => {
    if (!data || typeof data !== 'object') return null;
    return (
      <div className="detail-data">
        <div className="detail-data-grid">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="detail-data-item">
              <span className="data-key">{key.replace(/_/g, ' ')}</span>
              <span className="data-value">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getAIContent = (result) => {
    if (!result) return '';
    if (result.error) return `**Error:** ${result.error}`;
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    }
    return JSON.stringify(result, null, 2);
  };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
          <div className="feature-title">
            <span className="icon">{feature.icon}</span>
            <h1>{feature.title}</h1>
          </div>
        </div>
        <div className="feature-actions">
          <button className="btn btn-success btn-sm" onClick={openCreate}>
            + New Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ai-loading">
          <div className="spinner" />
          Loading data...
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {feature.columns.map((col) => (
                  <th key={col}>{formatColHeader(col)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={feature.columns.length + 2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No data available. Click "New Item" to add one.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} onClick={() => { setSelected(item); setAiResult(null); }}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    {feature.columns.map((col) => (
                      <td key={col}>
                        {col === feature.badgeField ? (
                          <span className={getBadgeClass(item[col])}>
                            {formatColumnValue(col, item[col])}
                          </span>
                        ) : (
                          formatColumnValue(col, item[col])
                        )}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="detail-overlay" onClick={() => setSelected(null)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h2>{feature.icon} {selected[feature.primaryField] || `Item #${selected.id}`}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            </div>

            {feature.formFields.map((field) => {
              const val = selected[field.name];
              if (val === null || val === undefined || val === '') return null;
              return (
                <div key={field.name} className="detail-field">
                  <div className="field-label">{field.label}</div>
                  <div className="field-value">
                    {field.name === (feature.badgeField) ? (
                      <span className={getBadgeClass(val)}>{String(val)}</span>
                    ) : (
                      String(val)
                    )}
                  </div>
                </div>
              );
            })}

            {selected.data && (
              <div className="detail-field">
                <div className="field-label">Additional Data</div>
                {renderDataSection(selected.data)}
              </div>
            )}

            <div className="detail-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(selected)}>
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected)}>
                Delete
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--purple)', color: 'white' }}
                onClick={() => runAI(selected)}
                disabled={aiLoading}
              >
                {aiLoading ? 'Analyzing...' : '🤖 AI Analysis'}
              </button>
            </div>

            {/* AI Analysis Output */}
            {(aiLoading || aiResult) && (
              <div className="ai-section">
                <h3>🤖 AI Analysis</h3>
                {aiLoading ? (
                  <div className="ai-loading">
                    <div className="spinner" />
                    Running AI analysis via OpenRouter...
                  </div>
                ) : (
                  <div className="ai-output">
                    <div className="ai-content">
                      <ReactMarkdown>{getAIContent(aiResult)}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editItem ? 'Edit' : 'New'} {feature.title.replace(/s$/, '')}</h2>
            {feature.formFields.map((field) => (
              <div key={field.name} className="form-group">
                <label>{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                    step={field.type === 'number' ? 'any' : undefined}
                  />
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success btn-sm" onClick={handleSave}>
                {editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturePage;

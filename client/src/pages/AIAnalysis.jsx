import React, { useState } from 'react';
import api from '../api';

const ANALYSIS_TYPES = [
  { key: 'analyze-pattern', label: 'Climate Pattern Analysis', dataKey: 'patternData', placeholder: '{ "region": "North Atlantic", "pattern_type": "ENSO", "severity": "High" }' },
  { key: 'forecast-analysis', label: 'Weather Forecast Analysis', dataKey: 'forecastData', placeholder: '{ "location": "Miami, FL", "forecast_date": "2026-05-15", "conditions": "Tropical Storm" }' },
  { key: 'temperature-analysis', label: 'Temperature Analysis', dataKey: 'tempData', placeholder: '{ "region": "Arctic", "predicted_temp": -10, "actual_temp": -5, "confidence": 85 }' },
  { key: 'precipitation-analysis', label: 'Precipitation Analysis', dataKey: 'precipData', placeholder: '{ "region": "California", "annual_mm": 350, "drought_index": 3.2 }' },
  { key: 'drought-analysis', label: 'Drought Assessment', dataKey: 'droughtData', placeholder: '{ "region": "Horn of Africa", "SPI": -2.5, "duration_months": 18 }' },
  { key: 'flood-analysis', label: 'Flood Risk Analysis', dataKey: 'floodData', placeholder: '{ "region": "Bangladesh", "river_level_m": 8.5, "affected_area_km2": 12000 }' },
  { key: 'storm-analysis', label: 'Storm Tracking Analysis', dataKey: 'stormData', placeholder: '{ "storm_name": "Helios", "category": 4, "wind_mph": 145, "track": "Gulf Coast" }' },
  { key: 'sea-level-analysis', label: 'Sea Level Projection', dataKey: 'seaLevelData', placeholder: '{ "location": "Miami Beach", "current_rise_mm_yr": 4.5, "projection_2050_cm": 35 }' },
  { key: 'air-quality-analysis', label: 'Air Quality Analysis', dataKey: 'aqData', placeholder: '{ "city": "Delhi", "AQI": 285, "PM25": 180, "ozone_ppb": 42 }' },
  { key: 'carbon-analysis', label: 'Carbon Emission Analysis', dataKey: 'carbonData', placeholder: '{ "sector": "Energy", "co2_mt": 450, "target_reduction_pct": 45 }' },
  { key: 'crop-yield-analysis', label: 'Crop Yield Impact', dataKey: 'cropData', placeholder: '{ "crop": "Wheat", "region": "Great Plains", "projected_loss_pct": 25 }' },
  { key: 'insurance-risk-analysis', label: 'Insurance Risk Assessment', dataKey: 'insuranceData', placeholder: '{ "location": "Houston TX", "property_value": 500000, "flood_zone": "AE" }' },
  { key: 'real-estate-analysis', label: 'Real Estate Climate Risk', dataKey: 'realEstateData', placeholder: '{ "address": "123 Ocean Dr, Miami", "elevation_ft": 3, "flood_risk": "High" }' },
  { key: 'historical-analysis', label: 'Historical Climate Analysis', dataKey: 'historicalData', placeholder: '{ "period": "1980-2025", "region": "Mediterranean", "trend": "warming 2.1C" }' },
  { key: 'alert-analysis', label: 'Climate Alert Analysis', dataKey: 'alertData', placeholder: '{ "alert_type": "Hurricane Warning", "severity": "Critical", "region": "Florida" }' },
  { key: 'multi-hazard-assessment', label: 'Multi-Hazard Assessment (New)', dataKey: null, fields: ['region', 'timeframe'], placeholder: null },
  { key: 'climate-migration', label: 'Climate Migration Analysis (New)', dataKey: null, fields: ['region_data', 'ten_year_projection'], placeholder: null },
  { key: 'economic-impact', label: 'Economic Impact Analysis (New)', dataKey: null, fields: ['climate_event', 'affected_region', 'industry_data'], placeholder: null },
  { key: 'scenario-model', label: 'Multi-Scenario Modeling (New)', dataKey: null, fields: ['region', 'timeframe', 'scenarios'], placeholder: null },
  { key: 'adaptation-roadmap', label: 'Adaptation Roadmap (New)', dataKey: null, fields: ['location', 'industry', 'horizon_years'], placeholder: null },
];

function AIAnalysis() {
  const [selectedType, setSelectedType] = useState(ANALYSIS_TYPES[0]);
  const [jsonInput, setJsonInput] = useState('');
  const [fieldInputs, setFieldInputs] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (key) => {
    const t = ANALYSIS_TYPES.find(x => x.key === key);
    setSelectedType(t);
    setResult(null);
    setError('');
    setJsonInput('');
    setFieldInputs({});
  };

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let payload = {};

      if (selectedType.fields) {
        // Multi-field endpoints
        for (const f of selectedType.fields) {
          const raw = fieldInputs[f] || '';
          try { payload[f] = JSON.parse(raw); } catch { payload[f] = raw; }
        }
      } else {
        // Single JSON data key
        let parsed;
        try { parsed = JSON.parse(jsonInput || '{}'); } catch (e) {
          setError('Invalid JSON input: ' + e.message);
          setLoading(false);
          return;
        }
        payload[selectedType.dataKey] = parsed;
      }

      const endpoint = `/ai/${selectedType.key}`;
      const res = await api.post(endpoint, payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractContent = (data) => {
    if (!data) return null;
    if (data.analysis) return data.analysis;
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    return JSON.stringify(data, null, 2);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>AI Climate Analysis</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Run any of the {ANALYSIS_TYPES.length} AI analysis types using OpenRouter Claude.</p>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Analysis type selector */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Analysis Type</label>
        <select value={selectedType.key} onChange={e => handleTypeChange(e.target.value)}
          style={{ display: 'block', width: '100%', marginTop: '8px', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
          {ANALYSIS_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {/* Input area */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        {selectedType.fields ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {selectedType.fields.map(f => (
              <div key={f}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                <textarea
                  value={fieldInputs[f] || ''}
                  onChange={e => setFieldInputs(prev => ({ ...prev, [f]: e.target.value }))}
                  rows={3}
                  placeholder={f === 'affected_region' ? 'e.g. "Southeast United States"' : '{ "key": "value" }'}
                  style={{ display: 'block', width: '100%', marginTop: '6px', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              Input Data (JSON) — key: <code style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '4px' }}>{selectedType.dataKey}</code>
            </label>
            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              rows={6}
              placeholder={selectedType.placeholder}
              style={{ display: 'block', width: '100%', marginTop: '8px', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
            />
          </div>
        )}

        <button onClick={handleRun} disabled={loading}
          style={{ marginTop: '16px', padding: '10px 28px', background: loading ? 'var(--text-muted)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Analysis Result</h3>
            {result.model && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '6px' }}>
                {result.model}
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
            {extractContent(result)}
          </div>
          {result.usage && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Tokens: {result.usage.prompt_tokens} prompt + {result.usage.completion_tokens} completion = {result.usage.total_tokens} total
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAnalysis;

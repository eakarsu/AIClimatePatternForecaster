import React, { useState } from 'react';
import api from '../api';

export default function CommunityRiskMatrix() {
  const [payload, setPayload] = useState('{"region":"Miami-Dade","hazards":[{"name":"coastal flooding","exposure":8,"vulnerability":7,"probability":8},{"name":"heat wave","exposure":7,"vulnerability":6,"probability":7}]}');
  const [result, setResult] = useState(null);
  const run = async () => setResult((await api.post('/community-risk-matrix/score', JSON.parse(payload || '{}'))).data);
  return (
    <div className="feature-page">
      <div className="feature-header"><h1>Community Risk Matrix</h1><button className="btn btn-primary" onClick={run}>Score Region</button></div>
      <textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} />
      {result && <pre className="ai-result">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

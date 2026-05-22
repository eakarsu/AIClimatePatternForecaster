const express = require('express');
const router = express.Router();

router.post('/score', (req, res) => {
  const hazards = Array.isArray(req.body?.hazards) ? req.body.hazards : [];
  const rows = hazards.map((h) => {
    const exposure = Number(h.exposure || 1);
    const vulnerability = Number(h.vulnerability || 1);
    const probability = Number(h.probability || 1);
    const score = Math.min(100, Math.round(exposure * vulnerability * probability));
    return {
      hazard: h.name || 'hazard',
      score,
      band: score >= 70 ? 'critical' : score >= 40 ? 'elevated' : 'watch',
      action: score >= 70 ? 'Fund adaptation project and alert emergency managers.' : score >= 40 ? 'Add monitoring trigger and mitigation owner.' : 'Keep in quarterly review.',
    };
  });
  res.json({ region: req.body?.region || 'region', matrix: rows, generated_at: new Date().toISOString() });
});

module.exports = router;

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/dashboard — aggregate stats
router.get('/', async (req, res) => {
  try {
    const [
      patternsResult,
      alertsResult,
      forecastsResult,
      analysesResult,
      recentAnalysesResult,
      severityResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM climate_patterns'),
      pool.query('SELECT COUNT(*) FROM alerts WHERE active = TRUE'),
      pool.query('SELECT COUNT(*) FROM weather_forecasts'),
      pool.query('SELECT COUNT(*) FROM climate_analyses'),
      pool.query(`
        SELECT id, analysis_type, created_at,
               ai_result_json->>'model' AS model
        FROM climate_analyses
        ORDER BY created_at DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT severity, COUNT(*) AS count
        FROM alerts
        WHERE active = TRUE
        GROUP BY severity
        ORDER BY severity
      `),
    ]);

    res.json({
      stats: {
        totalPatterns: parseInt(patternsResult.rows[0].count),
        activeAlerts: parseInt(alertsResult.rows[0].count),
        totalForecasts: parseInt(forecastsResult.rows[0].count),
        totalAiAnalyses: parseInt(analysesResult.rows[0].count),
      },
      alertsBySeverity: severityResult.rows,
      recentAnalyses: recentAnalysesResult.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

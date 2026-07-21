const express = require('express');
const cors = require('cors');
require('dotenv').config();
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must be at least 32 characters');

const { aiRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({origin:(process.env.CORS_ORIGIN||'http://localhost:3000').split(','),credentials:true}));
app.use(express.json({limit:'1mb'}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/climate-patterns', require('./routes/climatePatterns'));
app.use('/api/weather-forecasts', require('./routes/weatherForecasts'));
app.use('/api/temperature-predictions', require('./routes/temperaturePredictions'));
app.use('/api/precipitation-analysis', require('./routes/precipitationAnalysis'));
app.use('/api/drought-assessments', require('./routes/droughtAssessments'));
app.use('/api/flood-predictions', require('./routes/floodPredictions'));
app.use('/api/storm-tracking', require('./routes/stormTracking'));
app.use('/api/sea-level-projections', require('./routes/seaLevelProjections'));
app.use('/api/air-quality', require('./routes/airQuality'));
app.use('/api/carbon-emissions', require('./routes/carbonEmissions'));
app.use('/api/crop-yield-predictions', require('./routes/cropYieldPredictions'));
app.use('/api/insurance-risk', require('./routes/insuranceRisk'));
app.use('/api/real-estate-climate-risk', require('./routes/realEstateClimateRisk'));
app.use('/api/historical-climate-data', require('./routes/historicalClimateData'));
app.use('/api/climate-alerts', require('./routes/climateAlerts'));

// AI routes with rate limiting applied
app.use('/api/ai', aiRateLimiter, require('./routes/ai'));
app.use('/api/ai', aiRateLimiter, require('./routes/aiNew'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Alerts route (standalone with resolve support)
app.use('/api/alerts', require('./routes/alerts'));

// Audit-recommended additions (notifications, webhooks)
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/webhooks', require('./routes/webhooks'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/scenario-modeler', require('./routes/multiScenarioModeler')); // apply pass 6 — audit custom suggestion

app.use('/api/adaptation-roadmap', require('./routes/adaptationRoadmap')); // apply pass 6 — audit custom suggestion

app.use('/api/supply-chain-climate', require('./routes/supplyChainClimateMap')); // apply pass 6 — audit custom suggestion

app.use('/api/climate-integrations', require('./routes/climateDataIntegrations')); // apply pass 6 — audit custom suggestion
app.use('/api/community-risk-matrix', require('./routes/communityRiskMatrix'));
app.use('/api/governed-forecasts', require('./routes/governedForecasts'));
app.listen(PORT, () => {
  console.log(`Climate Forecaster API running on port ${PORT}`);
});

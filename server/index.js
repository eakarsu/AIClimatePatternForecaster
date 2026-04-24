const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌍 Climate Forecaster API running on port ${PORT}`);
});

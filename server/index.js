const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { aiRateLimiter } = require('./middleware/rateLimiter');

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
app.listen(PORT, () => {
  console.log(`Climate Forecaster API running on port ${PORT}`);
});


// === Batch 01 Gaps & Frontend Mounts ===
app.use('/api/gap-no-physics-informed-ml-downscaling-for-hyperlocal-', require('./routes/gap_no_physics_informed_ml_downscaling_for_hyperlocal_'));
app.use('/api/gap-no-ai-imagery-analysis-satellite-radar-integrated', require('./routes/gap_no_ai_imagery_analysis_satellite_radar_integrated'));
app.use('/api/gap-no-ai-scenario-planning-narrative-generator-for-bo', require('./routes/gap_no_ai_scenario_planning_narrative_generator_for_bo'));
app.use('/api/gap-no-ai-sub-seasonal-to-seasonal-s2s-outlook-synthes', require('./routes/gap_no_ai_sub_seasonal_to_seasonal_s2s_outlook_synthes'));
app.use('/api/gap-only-8-frontend-pages-despite-22-backend-routes-ui', require('./routes/gap_only_8_frontend_pages_despite_22_backend_routes_ui'));
app.use('/api/gap-notification-routes-exist-but-no-sms-email-deliver', require('./routes/gap_notification_routes_exist_but_no_sms_email_deliver'));
app.use('/api/gap-no-export-reporting-module-for-esg-cdp-filings', require('./routes/gap_no_export_reporting_module_for_esg_cdp_filings'));
app.use('/api/gap-no-direct-downstream-risk-erm-api-client-only-gene', require('./routes/gap_no_direct_downstream_risk_erm_api_client_only_gene'));
app.use('/api/gap-no-mapping-gis-visualization-layer', require('./routes/gap_no_mapping_gis_visualization_layer'));
app.use('/api/gap-no-real-time-noaa-ecmwf-feed-ingestion-pipeline', require('./routes/gap_no_real_time_noaa_ecmwf_feed_ingestion_pipeline'));

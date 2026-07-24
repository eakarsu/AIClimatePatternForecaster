const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');
const auth = require('../middleware/auth');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CLIMATE_SYSTEM_PROMPT =
  'You are an expert climate scientist and meteorologist. Provide evidence-based climate analysis, forecasting, and risk assessment with actionable recommendations.';

async function askAI(prompt, systemPrompt) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt || CLIMATE_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Climate Pattern Forecaster',
      },
      timeout: 60000,
    }
  );
  return response.data;
}

// Helper: save analysis to DB if table exists
async function saveAnalysis(type, inputData, result, userId) {
  try {
    await pool.query(
      `INSERT INTO climate_analyses (analysis_type, input_data_json, ai_result_json, user_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [type, JSON.stringify(inputData), JSON.stringify(result), userId || null]
    );
  } catch (_) {
    // Non-fatal — table may not exist yet
  }
}

router.use(auth);

// 1. Climate Pattern Analysis
router.post('/analyze-pattern', async (req, res) => {
  try {
    const { patternData } = req.body;
    if (!patternData) return res.status(400).json({ error: 'patternData is required' });
    const result = await askAI(
      `Analyze this climate pattern and provide insights, potential impacts, and recommendations:\n${JSON.stringify(patternData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('analyze-pattern', patternData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 2. Weather Forecast Analysis
router.post('/forecast-analysis', async (req, res) => {
  try {
    const { forecastData } = req.body;
    if (!forecastData) return res.status(400).json({ error: 'forecastData is required' });
    const result = await askAI(
      `Analyze this weather forecast data and provide detailed insights:\n${JSON.stringify(forecastData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('forecast-analysis', forecastData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 3. Temperature Analysis
router.post('/temperature-analysis', async (req, res) => {
  try {
    const { tempData } = req.body;
    if (!tempData) return res.status(400).json({ error: 'tempData is required' });
    const result = await askAI(
      `Analyze these temperature predictions and model performance:\n${JSON.stringify(tempData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('temperature-analysis', tempData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 4. Precipitation Analysis
router.post('/precipitation-analysis', async (req, res) => {
  try {
    const { precipData } = req.body;
    if (!precipData) return res.status(400).json({ error: 'precipData is required' });
    const result = await askAI(
      `Analyze this precipitation data and provide water resource insights:\n${JSON.stringify(precipData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('precipitation-analysis', precipData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 5. Drought Analysis
router.post('/drought-analysis', async (req, res) => {
  try {
    const { droughtData } = req.body;
    if (!droughtData) return res.status(400).json({ error: 'droughtData is required' });
    const result = await askAI(
      `Assess this drought situation and provide mitigation recommendations:\n${JSON.stringify(droughtData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('drought-analysis', droughtData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 6. Flood Analysis
router.post('/flood-analysis', async (req, res) => {
  try {
    const { floodData } = req.body;
    if (!floodData) return res.status(400).json({ error: 'floodData is required' });
    const result = await askAI(
      `Analyze this flood risk data and provide emergency recommendations:\n${JSON.stringify(floodData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('flood-analysis', floodData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 7. Storm Analysis
router.post('/storm-analysis', async (req, res) => {
  try {
    const { stormData } = req.body;
    if (!stormData) return res.status(400).json({ error: 'stormData is required' });
    const result = await askAI(
      `Analyze this storm data and provide tracking predictions:\n${JSON.stringify(stormData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('storm-analysis', stormData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 8. Sea Level Analysis
router.post('/sea-level-analysis', async (req, res) => {
  try {
    const { seaLevelData } = req.body;
    if (!seaLevelData) return res.status(400).json({ error: 'seaLevelData is required' });
    const result = await askAI(
      `Analyze these sea level projections and coastal impacts:\n${JSON.stringify(seaLevelData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('sea-level-analysis', seaLevelData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 9. Air Quality Analysis
router.post('/air-quality-analysis', async (req, res) => {
  try {
    const { aqData } = req.body;
    if (!aqData) return res.status(400).json({ error: 'aqData is required' });
    const result = await askAI(
      `Analyze this air quality data and provide health recommendations:\n${JSON.stringify(aqData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('air-quality-analysis', aqData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 10. Carbon Analysis
router.post('/carbon-analysis', async (req, res) => {
  try {
    const { carbonData } = req.body;
    if (!carbonData) return res.status(400).json({ error: 'carbonData is required' });
    const result = await askAI(
      `Analyze these carbon emission data and suggest reduction strategies:\n${JSON.stringify(carbonData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('carbon-analysis', carbonData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 11. Crop Yield Analysis
router.post('/crop-yield-analysis', async (req, res) => {
  try {
    const { cropData } = req.body;
    if (!cropData) return res.status(400).json({ error: 'cropData is required' });
    const result = await askAI(
      `Analyze these crop yield predictions and climate impacts:\n${JSON.stringify(cropData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('crop-yield-analysis', cropData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 12. Insurance Risk Analysis
router.post('/insurance-risk-analysis', async (req, res) => {
  try {
    const { insuranceData } = req.body;
    if (!insuranceData) return res.status(400).json({ error: 'insuranceData is required' });
    const result = await askAI(
      `Analyze this climate-related insurance risk assessment:\n${JSON.stringify(insuranceData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('insurance-risk-analysis', insuranceData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 13. Real Estate Analysis
router.post('/real-estate-analysis', async (req, res) => {
  try {
    const { realEstateData } = req.body;
    if (!realEstateData) return res.status(400).json({ error: 'realEstateData is required' });
    const result = await askAI(
      `Analyze the climate risk for this real estate property:\n${JSON.stringify(realEstateData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('real-estate-analysis', realEstateData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 14. Historical Analysis
router.post('/historical-analysis', async (req, res) => {
  try {
    const { historicalData } = req.body;
    if (!historicalData) return res.status(400).json({ error: 'historicalData is required' });
    const result = await askAI(
      `Analyze this historical climate data and identify trends:\n${JSON.stringify(historicalData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('historical-analysis', historicalData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// 15. Climate Alert Analysis
router.post('/alert-analysis', async (req, res) => {
  try {
    const { alertData } = req.body;
    if (!alertData) return res.status(400).json({ error: 'alertData is required' });
    const result = await askAI(
      `Analyze this climate alert and provide emergency guidance:\n${JSON.stringify(alertData, null, 2)}`,
      CLIMATE_SYSTEM_PROMPT
    );
    await saveAnalysis('alert-analysis', alertData, result, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

module.exports = router;

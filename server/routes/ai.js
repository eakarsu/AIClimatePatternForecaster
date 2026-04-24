const express = require('express');
const router = express.Router();
const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function askAI(prompt, systemPrompt) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemPrompt },
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
    }
  );
  return response.data;
}

// Climate Pattern Analysis
router.post('/analyze-pattern', async (req, res) => {
  try {
    const { patternData } = req.body;
    const result = await askAI(
      `Analyze this climate pattern and provide insights, potential impacts, and recommendations:\n${JSON.stringify(patternData, null, 2)}`,
      'You are an expert climate scientist. Provide detailed analysis of climate patterns with actionable insights. Format your response with clear sections: Overview, Key Findings, Impacts, and Recommendations.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Weather Forecast AI
router.post('/forecast-analysis', async (req, res) => {
  try {
    const { forecastData } = req.body;
    const result = await askAI(
      `Analyze this weather forecast data and provide detailed insights:\n${JSON.stringify(forecastData, null, 2)}`,
      'You are a meteorologist AI assistant. Analyze weather data and provide detailed forecasting insights, potential severe weather risks, and practical advice for the public.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Temperature Prediction AI
router.post('/temperature-analysis', async (req, res) => {
  try {
    const { tempData } = req.body;
    const result = await askAI(
      `Analyze these temperature predictions and model performance:\n${JSON.stringify(tempData, null, 2)}`,
      'You are a climate modeling expert. Evaluate temperature prediction accuracy, identify trends, and suggest model improvements. Discuss the implications of temperature anomalies.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Precipitation Analysis AI
router.post('/precipitation-analysis', async (req, res) => {
  try {
    const { precipData } = req.body;
    const result = await askAI(
      `Analyze this precipitation data and provide water resource insights:\n${JSON.stringify(precipData, null, 2)}`,
      'You are a hydrologist and water resources expert. Analyze precipitation patterns, drought conditions, and water availability. Provide recommendations for water management.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Drought Assessment AI
router.post('/drought-analysis', async (req, res) => {
  try {
    const { droughtData } = req.body;
    const result = await askAI(
      `Assess this drought situation and provide mitigation recommendations:\n${JSON.stringify(droughtData, null, 2)}`,
      'You are a drought and water scarcity expert. Assess drought severity, predict trajectory, and recommend mitigation strategies for agriculture, water supply, and ecosystems.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Flood Prediction AI
router.post('/flood-analysis', async (req, res) => {
  try {
    const { floodData } = req.body;
    const result = await askAI(
      `Analyze this flood risk data and provide emergency recommendations:\n${JSON.stringify(floodData, null, 2)}`,
      'You are a flood risk management expert. Analyze flood conditions, predict severity, and provide evacuation and mitigation recommendations.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Storm Tracking AI
router.post('/storm-analysis', async (req, res) => {
  try {
    const { stormData } = req.body;
    const result = await askAI(
      `Analyze this storm data and provide tracking predictions:\n${JSON.stringify(stormData, null, 2)}`,
      'You are a tropical meteorology expert. Analyze storm characteristics, predict track and intensity changes, and provide safety recommendations.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Sea Level Projection AI
router.post('/sea-level-analysis', async (req, res) => {
  try {
    const { seaLevelData } = req.body;
    const result = await askAI(
      `Analyze these sea level projections and coastal impacts:\n${JSON.stringify(seaLevelData, null, 2)}`,
      'You are a coastal climate scientist. Analyze sea level rise projections, assess coastal vulnerability, and recommend adaptation strategies.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Air Quality AI
router.post('/air-quality-analysis', async (req, res) => {
  try {
    const { aqData } = req.body;
    const result = await askAI(
      `Analyze this air quality data and provide health recommendations:\n${JSON.stringify(aqData, null, 2)}`,
      'You are an air quality and public health expert. Analyze air quality indices, identify pollution sources, and provide health protection recommendations.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Carbon Emission AI
router.post('/carbon-analysis', async (req, res) => {
  try {
    const { carbonData } = req.body;
    const result = await askAI(
      `Analyze these carbon emission data and suggest reduction strategies:\n${JSON.stringify(carbonData, null, 2)}`,
      'You are a carbon emissions and sustainability expert. Analyze emission sources, evaluate reduction targets, and recommend decarbonization pathways.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Crop Yield AI
router.post('/crop-yield-analysis', async (req, res) => {
  try {
    const { cropData } = req.body;
    const result = await askAI(
      `Analyze these crop yield predictions and climate impacts:\n${JSON.stringify(cropData, null, 2)}`,
      'You are an agricultural climate expert. Analyze crop yield predictions, assess climate impacts on agriculture, and recommend adaptation strategies for farmers.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Insurance Risk AI
router.post('/insurance-risk-analysis', async (req, res) => {
  try {
    const { insuranceData } = req.body;
    const result = await askAI(
      `Analyze this climate-related insurance risk assessment:\n${JSON.stringify(insuranceData, null, 2)}`,
      'You are a climate risk insurance analyst. Evaluate climate-related risks for insurance, assess premium adequacy, and recommend coverage strategies.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Real Estate Climate Risk AI
router.post('/real-estate-analysis', async (req, res) => {
  try {
    const { realEstateData } = req.body;
    const result = await askAI(
      `Analyze the climate risk for this real estate property:\n${JSON.stringify(realEstateData, null, 2)}`,
      'You are a real estate climate risk analyst. Evaluate property-level climate risks, project future impacts on property value, and recommend mitigation investments.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Historical Climate Analysis AI
router.post('/historical-analysis', async (req, res) => {
  try {
    const { historicalData } = req.body;
    const result = await askAI(
      `Analyze this historical climate data and identify trends:\n${JSON.stringify(historicalData, null, 2)}`,
      'You are a paleoclimatologist and climate historian. Analyze historical climate trends, contextualize current changes, and project future scenarios based on historical patterns.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// Climate Alert AI
router.post('/alert-analysis', async (req, res) => {
  try {
    const { alertData } = req.body;
    const result = await askAI(
      `Analyze this climate alert and provide emergency guidance:\n${JSON.stringify(alertData, null, 2)}`,
      'You are an emergency management and climate alert specialist. Analyze the severity of climate alerts, assess risks, and provide clear safety instructions and preparedness guidance.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

module.exports = router;

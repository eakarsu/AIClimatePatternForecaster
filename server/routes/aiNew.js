const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CLIMATE_SYSTEM_PROMPT =
  'You are an expert climate scientist and meteorologist. Provide evidence-based climate analysis, forecasting, and risk assessment with actionable recommendations.';

async function askAI(prompt, systemPrompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error('AI not configured');
    err.statusCode = 503;
    throw err;
  }
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt || CLIMATE_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Climate Pattern Forecaster',
      },
      timeout: 90000,
    }
  );
  return response.data;
}

async function saveAnalysis(type, inputData, result, userId) {
  try {
    await pool.query(
      `INSERT INTO climate_analyses (analysis_type, input_data_json, ai_result_json, user_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [type, JSON.stringify(inputData), JSON.stringify(result), userId || null]
    );
  } catch (_) { /* Non-fatal */ }
}

/**
 * POST /api/ai/multi-hazard-assessment
 * Body: { region: string, timeframe: string }
 * Returns combined analysis of flood + drought + storm hazards with interaction effects.
 */
router.post('/multi-hazard-assessment', async (req, res) => {
  try {
    const { region, timeframe } = req.body;
    if (!region) return res.status(400).json({ error: 'region is required' });
    if (!timeframe) return res.status(400).json({ error: 'timeframe is required' });

    const result = await askAI(
      `Perform a comprehensive multi-hazard climate assessment for the following:

Region: ${region}
Timeframe: ${timeframe}

Analyze ALL of the following hazards and their interactions:
1. FLOOD RISK — probability, peak periods, affected zones
2. DROUGHT RISK — SPI projections, water stress index, agriculture impact
3. STORM RISK — frequency, intensity trends, track probabilities

Then assess COMPOUND & INTERACTION EFFECTS:
- How do concurrent or sequential hazard combinations amplify risk?
- Cascading failure scenarios (e.g., flood following drought)
- Compound event probability estimates

Provide:
- Per-hazard severity scores (0-10)
- Compound hazard severity score (0-10)
- Top 3 most likely disaster scenarios
- Priority mitigation recommendations for each hazard
- Integrated resilience strategy

Use structured markdown with tables where appropriate.`,
      CLIMATE_SYSTEM_PROMPT
    );

    await saveAnalysis('multi-hazard-assessment', { region, timeframe }, result, req.user?.id);
    res.json({
      analysis: result.choices?.[0]?.message?.content || 'No analysis available',
      model: result.model,
      usage: result.usage,
      region,
      timeframe,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

/**
 * POST /api/ai/climate-migration
 * Body: { region_data: object, ten_year_projection: object }
 * Returns population displacement risk, migration corridors, infrastructure vulnerability.
 */
router.post('/climate-migration', async (req, res) => {
  try {
    const { region_data, ten_year_projection } = req.body;
    if (!region_data) return res.status(400).json({ error: 'region_data is required' });
    if (!ten_year_projection) return res.status(400).json({ error: 'ten_year_projection is required' });

    const result = await askAI(
      `Conduct a climate-induced migration and displacement risk analysis:

Region Data:
${JSON.stringify(region_data, null, 2)}

10-Year Climate Projection:
${JSON.stringify(ten_year_projection, null, 2)}

Provide a detailed assessment covering:

1. POPULATION DISPLACEMENT RISK
   - Estimated at-risk population (absolute numbers and %)
   - Timeline of displacement waves
   - Vulnerability index by sub-region or demographic

2. MIGRATION CORRIDORS
   - Most likely migration routes and destination regions
   - Push vs. pull factor analysis
   - Cross-border migration implications

3. INFRASTRUCTURE VULNERABILITY
   - Critical infrastructure at risk (transport, water, energy, health)
   - Failure timeline projections
   - Cascading socioeconomic effects

4. ADAPTATION & POLICY RECOMMENDATIONS
   - Managed retreat strategies
   - Early-warning systems needed
   - Regional cooperation frameworks

Format response with clear sections and data tables.`,
      CLIMATE_SYSTEM_PROMPT
    );

    await saveAnalysis('climate-migration', { region_data, ten_year_projection }, result, req.user?.id);
    res.json({
      analysis: result.choices?.[0]?.message?.content || 'No analysis available',
      model: result.model,
      usage: result.usage,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

/**
 * POST /api/ai/economic-impact
 * Body: { climate_event: object, affected_region: string, industry_data: object }
 * Returns GDP impact estimate, sector-by-sector analysis, recovery timeline.
 */
router.post('/economic-impact', async (req, res) => {
  try {
    const { climate_event, affected_region, industry_data } = req.body;
    if (!climate_event) return res.status(400).json({ error: 'climate_event is required' });
    if (!affected_region) return res.status(400).json({ error: 'affected_region is required' });

    const result = await askAI(
      `Perform a comprehensive economic impact assessment for a climate event:

Climate Event:
${JSON.stringify(climate_event, null, 2)}

Affected Region: ${affected_region}

Industry Data:
${JSON.stringify(industry_data || {}, null, 2)}

Deliver a structured economic impact report including:

1. MACRO-ECONOMIC IMPACT
   - Estimated GDP impact (short-term: 0-1 year, medium-term: 1-5 years)
   - Inflation effects and supply chain disruptions
   - Fiscal cost to government (response + reconstruction)

2. SECTOR-BY-SECTOR ANALYSIS
   For each applicable sector (Agriculture, Manufacturing, Energy, Tourism, Real Estate, Insurance, Finance):
   - Direct damage estimate
   - Revenue/productivity loss
   - Recovery timeline
   - Resilience recommendations

3. EMPLOYMENT & SOCIAL IMPACT
   - Jobs affected (temporary vs. permanent)
   - Poverty and inequality effects
   - Health cost burden

4. RECOVERY TIMELINE
   - Phase 1: Emergency response (0-3 months)
   - Phase 2: Reconstruction (3-24 months)
   - Phase 3: Long-term adaptation (2-10 years)
   - Key milestones and dependencies

5. RISK-ADJUSTED INVESTMENT PRIORITIES
   - Top 5 investments for maximum resilience ROI

Format with tables, estimated figures in USD billions, and confidence ranges.`,
      CLIMATE_SYSTEM_PROMPT
    );

    await saveAnalysis('economic-impact', { climate_event, affected_region, industry_data }, result, req.user?.id);
    res.json({
      analysis: result.choices?.[0]?.message?.content || 'No analysis available',
      model: result.model,
      usage: result.usage,
      affected_region,
    });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ error: 'AI not configured' });
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

/**
 * POST /api/ai/scenario-model
 * Body: { region: string, timeframe: string, scenarios?: string[] }
 * Multi-scenario climate impact modeling — optimistic / baseline / pessimistic.
 */
router.post('/scenario-model', async (req, res) => {
  try {
    const { region, timeframe, scenarios } = req.body;
    if (!region) return res.status(400).json({ error: 'region is required' });
    if (!timeframe) return res.status(400).json({ error: 'timeframe is required' });

    const requested = Array.isArray(scenarios) && scenarios.length
      ? scenarios
      : ['optimistic', 'baseline', 'pessimistic'];

    const result = await askAI(
      `Build a multi-scenario climate impact model.

Region: ${region}
Timeframe: ${timeframe}
Scenarios: ${requested.join(', ')}

For EACH scenario, provide:

1. ASSUMPTIONS
   - Emissions trajectory (RCP / SSP-style framing)
   - Policy and adaptation assumptions
   - Confidence level

2. PHYSICAL CLIMATE OUTCOMES
   - Temperature change vs. baseline
   - Precipitation regime shifts
   - Sea-level rise (if coastal)
   - Frequency/intensity changes for storms, floods, droughts, heatwaves

3. IMPACT METRICS
   - Population exposure
   - GDP / economic loss range (USD)
   - Critical infrastructure at risk
   - Ecosystem and biodiversity impact

4. KEY UNCERTAINTIES & TIPPING POINTS
   - Sources of largest variance between scenarios
   - Threshold events that would force re-modeling

5. SCENARIO COMPARISON TABLE
   - Side-by-side numerical summary across all requested scenarios

Format with clear section headers and a final comparison table.`,
      CLIMATE_SYSTEM_PROMPT
    );

    await saveAnalysis('scenario-model', { region, timeframe, scenarios: requested }, result, req.user?.id);
    res.json({
      analysis: result.choices?.[0]?.message?.content || 'No analysis available',
      model: result.model,
      usage: result.usage,
      region,
      scenarios: requested,
    });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ error: 'AI not configured' });
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

/**
 * POST /api/ai/adaptation-roadmap
 * Body: { location: string, industry: string, horizon_years?: number }
 * Generates phased adaptation strategy from location + industry.
 */
router.post('/adaptation-roadmap', async (req, res) => {
  try {
    const { location, industry, horizon_years } = req.body;
    if (!location) return res.status(400).json({ error: 'location is required' });
    if (!industry) return res.status(400).json({ error: 'industry is required' });

    const horizon = Number.isFinite(Number(horizon_years)) ? Number(horizon_years) : 10;

    const result = await askAI(
      `Generate a climate adaptation roadmap.

Location: ${location}
Industry: ${industry}
Planning horizon: ${horizon} years

Produce a phased roadmap with:

1. CLIMATE-RISK BASELINE
   - Top 3-5 hazards relevant to this location and industry
   - Current exposure level (Low / Medium / High / Critical)

2. PHASED ACTIONS
   - Phase 1 (0-2 years): Quick wins, no-regret measures, monitoring setup
   - Phase 2 (2-5 years): Capital investments, process redesign
   - Phase 3 (5-${horizon} years): Structural / transformative adaptation

3. PER-ACTION DETAIL
   - Action description
   - Estimated cost band (USD)
   - Risk reduction target (%)
   - Owner / responsible function
   - Dependencies and prerequisites

4. KPIs & MILESTONES
   - Measurable indicators with targets per phase
   - Review cadence

5. FUNDING & POLICY HOOKS
   - Available grants, tax incentives, regulatory tail-winds
   - Insurance / risk-transfer instruments

Format with clear phase headers, action tables, and a summary KPI dashboard.`,
      CLIMATE_SYSTEM_PROMPT
    );

    await saveAnalysis('adaptation-roadmap', { location, industry, horizon_years: horizon }, result, req.user?.id);
    res.json({
      analysis: result.choices?.[0]?.message?.content || 'No analysis available',
      model: result.model,
      usage: result.usage,
      location,
      industry,
      horizon_years: horizon,
    });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ error: 'AI not configured' });
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

module.exports = router;

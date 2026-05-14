const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all weather forecasts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { location, forecast_date } = req.query;

    let conditions = [];
    let values = [];
    let idx = 1;

    if (location) { conditions.push(`location ILIKE $${idx++}`); values.push(`%${location}%`); }
    if (forecast_date) { conditions.push(`forecast_date = $${idx++}`); values.push(forecast_date); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM weather_forecasts ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM weather_forecasts ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM weather_forecasts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Weather forecast not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const {
      location, forecast_date, temperature_min, temperature_max,
      temperature_high, temperature_low, precipitation, precipitation_chance,
      wind_speed, humidity, confidence, conditions, description
    } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'location is required' });
    }

    const result = await pool.query(
      `INSERT INTO weather_forecasts
        (location, forecast_date, temperature_min, temperature_max, temperature_high, temperature_low,
         precipitation, precipitation_chance, wind_speed, humidity, confidence, conditions, description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW()) RETURNING *`,
      [
        location, forecast_date || null,
        temperature_min || null, temperature_max || null,
        temperature_high || null, temperature_low || null,
        precipitation || null, precipitation_chance || null,
        wind_speed || null, humidity || null, confidence || null,
        conditions || null, description || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM weather_forecasts WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Weather forecast not found' });

    const c = existing.rows[0];
    const b = req.body;

    const result = await pool.query(
      `UPDATE weather_forecasts SET
        location = $1, forecast_date = $2, temperature_min = $3, temperature_max = $4,
        temperature_high = $5, temperature_low = $6, precipitation = $7, precipitation_chance = $8,
        wind_speed = $9, humidity = $10, confidence = $11, conditions = $12, description = $13,
        updated_at = NOW()
       WHERE id = $14 RETURNING *`,
      [
        b.location || c.location,
        b.forecast_date !== undefined ? b.forecast_date : c.forecast_date,
        b.temperature_min !== undefined ? b.temperature_min : c.temperature_min,
        b.temperature_max !== undefined ? b.temperature_max : c.temperature_max,
        b.temperature_high !== undefined ? b.temperature_high : c.temperature_high,
        b.temperature_low !== undefined ? b.temperature_low : c.temperature_low,
        b.precipitation !== undefined ? b.precipitation : c.precipitation,
        b.precipitation_chance !== undefined ? b.precipitation_chance : c.precipitation_chance,
        b.wind_speed !== undefined ? b.wind_speed : c.wind_speed,
        b.humidity !== undefined ? b.humidity : c.humidity,
        b.confidence !== undefined ? b.confidence : c.confidence,
        b.conditions !== undefined ? b.conditions : c.conditions,
        b.description !== undefined ? b.description : c.description,
        req.params.id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM weather_forecasts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Weather forecast not found' });
    res.json({ message: 'Weather forecast deleted successfully', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

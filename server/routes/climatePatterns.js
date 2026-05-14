const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all climate patterns with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { region, severity, pattern_type } = req.query;

    let conditions = [];
    let values = [];
    let idx = 1;

    if (region) { conditions.push(`region ILIKE $${idx++}`); values.push(`%${region}%`); }
    if (severity) { conditions.push(`severity = $${idx++}`); values.push(severity); }
    if (pattern_type) { conditions.push(`pattern_type ILIKE $${idx++}`); values.push(`%${pattern_type}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM climate_patterns ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM climate_patterns ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
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
    const result = await pool.query('SELECT * FROM climate_patterns WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Climate pattern not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { region, pattern_type, name, start_date, end_date, severity, description, data_json } = req.body;
    if (!region || !pattern_type) {
      return res.status(400).json({ error: 'region and pattern_type are required' });
    }
    const result = await pool.query(
      `INSERT INTO climate_patterns (region, pattern_type, name, start_date, end_date, severity, description, data_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
      [region, pattern_type, name || null, start_date || null, end_date || null, severity || null, description || null, data_json ? JSON.stringify(data_json) : '{}']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM climate_patterns WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Climate pattern not found' });

    const { region, pattern_type, name, start_date, end_date, severity, description, data_json } = req.body;
    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE climate_patterns SET
        region = $1, pattern_type = $2, name = $3, start_date = $4, end_date = $5,
        severity = $6, description = $7, data_json = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        region || current.region,
        pattern_type || current.pattern_type,
        name !== undefined ? name : current.name,
        start_date !== undefined ? start_date : current.start_date,
        end_date !== undefined ? end_date : current.end_date,
        severity !== undefined ? severity : current.severity,
        description !== undefined ? description : current.description,
        data_json ? JSON.stringify(data_json) : current.data_json,
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
    const result = await pool.query('DELETE FROM climate_patterns WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Climate pattern not found' });
    res.json({ message: 'Climate pattern deleted successfully', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

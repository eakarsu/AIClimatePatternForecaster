const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all alerts with pagination and active/resolved filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { active, severity, region, alert_type } = req.query;

    let conditions = [];
    let values = [];
    let idx = 1;

    if (active !== undefined) {
      conditions.push(`active = $${idx++}`);
      values.push(active === 'true' || active === '1');
    }
    if (severity) { conditions.push(`severity = $${idx++}`); values.push(severity); }
    if (region) { conditions.push(`region ILIKE $${idx++}`); values.push(`%${region}%`); }
    if (alert_type) { conditions.push(`alert_type ILIKE $${idx++}`); values.push(`%${alert_type}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM alerts ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM alerts ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
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

// GET active alerts only
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts WHERE active = TRUE ORDER BY severity DESC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { alert_type, severity, region, message, active, expires_at, description, data_json } = req.body;
    if (!alert_type || !severity || !region || !message) {
      return res.status(400).json({ error: 'alert_type, severity, region, and message are required' });
    }
    const result = await pool.query(
      `INSERT INTO alerts (alert_type, severity, region, message, active, expires_at, description, data_json, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING *`,
      [
        alert_type, severity, region, message,
        active !== undefined ? active : true,
        expires_at || null, description || null,
        data_json ? JSON.stringify(data_json) : '{}'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update (including resolve)
router.put('/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });

    const c = existing.rows[0];
    const b = req.body;

    const result = await pool.query(
      `UPDATE alerts SET
        alert_type = $1, severity = $2, region = $3, message = $4,
        active = $5, expires_at = $6, description = $7,
        data_json = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        b.alert_type || c.alert_type,
        b.severity || c.severity,
        b.region || c.region,
        b.message || c.message,
        b.active !== undefined ? b.active : c.active,
        b.expires_at !== undefined ? b.expires_at : c.expires_at,
        b.description !== undefined ? b.description : c.description,
        b.data_json ? JSON.stringify(b.data_json) : c.data_json,
        req.params.id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT resolve an alert
router.put('/:id/resolve', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE alerts SET active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert resolved successfully', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert deleted successfully', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

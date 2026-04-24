const express = require('express');
const pool = require('../db');

function createCrudRouter(tableName, columns) {
  const router = express.Router();

  // GET all
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id DESC`);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by id
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const cols = columns.filter(c => req.body[c] !== undefined);
      const vals = cols.map(c => {
        if (c === 'data' && typeof req.body[c] === 'object') {
          return JSON.stringify(req.body[c]);
        }
        return req.body[c];
      });
      const placeholders = cols.map((_, i) => `$${i + 1}`);
      const query = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      const result = await pool.query(query, vals);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const cols = columns.filter(c => req.body[c] !== undefined);
      const vals = cols.map(c => {
        if (c === 'data' && typeof req.body[c] === 'object') {
          return JSON.stringify(req.body[c]);
        }
        return req.body[c];
      });
      const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      vals.push(req.params.id);
      const query = `UPDATE ${tableName} SET ${setClause}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`;
      const result = await pool.query(query, vals);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully', item: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;

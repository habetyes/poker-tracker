// backend/routes/players.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/players (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM players ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching players', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/players (host only)
router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating player', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/players/:id (host only) - for updating a player's name
router.put('/:id', authenticateToken, async (req, res) => {
  const playerId = req.params.id;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const result = await db.query('UPDATE players SET name = $1 WHERE id = $2 RETURNING *', [name, playerId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating player', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/players/:id (host only)
router.delete('/:id', authenticateToken, async (req, res) => {
  const playerId = req.params.id;
  try {
    await db.query('DELETE FROM players WHERE id = $1', [playerId]);
    res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    console.error('Error deleting player', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// backend/routes/games.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

/*
  POST /api/games – Create a new game (host only)
*/
router.post('/', authenticateToken, async (req, res) => {
  const { date, notes, players } = req.body;
  if (!date || !players || !Array.isArray(players)) {
    return res.status(400).json({ message: 'Invalid game data' });
  }
  try {
    // Insert the game record
    const gameResult = await db.query(
      'INSERT INTO games (game_date, notes) VALUES ($1, $2) RETURNING *',
      [date, notes || null]
    );
    const game = gameResult.rows[0];
    
    // Insert each player's game result
    for (const p of players) {
      await db.query(
        'INSERT INTO game_players (game_id, player_id, buy_ins, cash_out) VALUES ($1, $2, $3, $4)',
        [game.id, p.playerId, p.buyIns, p.cashOut]
      );
    }
    res.status(201).json({ gameId: game.id });
  } catch (err) {
    console.error('Error creating game', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
  PUT /api/games/:id – Update an existing game (host only)
*/
router.put('/:id', authenticateToken, async (req, res) => {
  const gameId = req.params.id;
  const { date, notes, players } = req.body;
  if (!date || !players || !Array.isArray(players)) {
    return res.status(400).json({ message: 'Invalid game data' });
  }
  try {
    // Update the game record
    await db.query('UPDATE games SET game_date = $1, notes = $2 WHERE id = $3', [date, notes || null, gameId]);
    
    // Remove all existing player records for this game
    await db.query('DELETE FROM game_players WHERE game_id = $1', [gameId]);
    
    // Insert updated player records
    for (const p of players) {
      await db.query(
        'INSERT INTO game_players (game_id, player_id, buy_ins, cash_out) VALUES ($1, $2, $3, $4)',
        [gameId, p.playerId, p.buyIns, p.cashOut]
      );
    }
    res.json({ message: 'Game updated successfully' });
  } catch (err) {
    console.error('Error updating game', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
  GET /api/games – Publicly get the list of games with total buyins computed.
*/
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT g.*, 
        COALESCE((
          SELECT SUM(buy_total)
          FROM (
            SELECT (SELECT COALESCE(SUM(buy), 0) FROM unnest(buy_ins) AS buy) AS buy_total
            FROM game_players gp
            WHERE gp.game_id = g.id
          ) sub
        ), 0) AS total_buyins
      FROM games g
      ORDER BY g.game_date DESC, g.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching games', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
  GET /api/games/:id – Publicly get a single game along with its players.
  (This endpoint remains unchanged from earlier.)
*/
router.get('/:id', async (req, res) => {
  const gameId = req.params.id;
  try {
    const gameResult = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    const game = gameResult.rows[0];
    // Retrieve associated players with a join to get the player's name
    const playersResult = await db.query(`
      SELECT gp.*, p.name as player_name
      FROM game_players gp
      JOIN players p ON gp.player_id = p.id
      WHERE gp.game_id = $1
    `, [gameId]);
    game.players = playersResult.rows;
    res.json(game);
  } catch (err) {
    console.error('Error fetching game', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
  DELETE /api/games/:id – Delete a game (host only)
*/
router.delete('/:id', authenticateToken, async (req, res) => {
  const gameId = req.params.id;
  try {
    await db.query('DELETE FROM games WHERE id = $1', [gameId]);
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    console.error('Error deleting game', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

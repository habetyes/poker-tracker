const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    // Use a Common Table Expression (CTE) to compute the per-row sum of buy-ins.
    const overallStatsQuery = `
      WITH gp_with_sum AS (
        SELECT 
          id, game_id, player_id, 
          (SELECT COALESCE(SUM(buy), 0) FROM unnest(buy_ins) AS buy) AS total_buy_ins,
          cash_out
        FROM game_players
      )
      SELECT p.id, p.name,
        COALESCE(SUM(gp.cash_out), 0) AS total_cash_out,
        COALESCE(SUM(gp.total_buy_ins), 0) AS total_buy_ins,
        COALESCE(SUM(gp.cash_out), 0) - COALESCE(SUM(gp.total_buy_ins), 0) AS net_profit
      FROM players p
      LEFT JOIN gp_with_sum gp ON p.id = gp.player_id
      GROUP BY p.id, p.name
      ORDER BY p.name;
    `;
    const overallStatsResult = await db.query(overallStatsQuery);
    const overallStats = overallStatsResult.rows;
    
    // Biggest winning night per player (per game profit = cash_out minus that game's total buy-ins)
    const biggestWinQuery = `
      WITH gp_with_sum AS (
        SELECT 
          id, game_id, player_id, 
          (SELECT COALESCE(SUM(buy), 0) FROM unnest(buy_ins) AS buy) AS total_buy_ins,
          cash_out
        FROM game_players
      )
      SELECT player_id, MAX(cash_out - total_buy_ins) AS biggest_win
      FROM gp_with_sum
      GROUP BY player_id;
    `;
    const biggestWinResult = await db.query(biggestWinQuery);
    const biggestWinMap = {};
    biggestWinResult.rows.forEach(row => {
      biggestWinMap[row.player_id] = row.biggest_win;
    });
    
    // Merge the two results
    const stats = overallStats.map(player => ({
      id: player.id,
      name: player.name,
      totalBuyIns: parseInt(player.total_buy_ins, 10),
      totalCashOut: parseInt(player.total_cash_out, 10),
      netProfit: parseInt(player.net_profit, 10),
      biggestWin: biggestWinMap[player.id] !== undefined ? parseInt(biggestWinMap[player.id], 10) : 0
    }));
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

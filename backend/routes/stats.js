const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    // extract optional date filtering query parameters
    const { start_date, end_date } = req.query;
    // If not provided, use null for our query.
    const startDate = start_date ? start_date : null;
    const endDate = end_date ? end_date : null;

    // Use a CTE to compute the per-row sum of buy-ins, applying date filters by joining the games table.
    const overallStatsQuery = `
      WITH gp_with_sum AS (
        SELECT 
          gp.id, 
          gp.game_id, 
          gp.player_id, 
          (SELECT COALESCE(SUM(buy), 0) FROM unnest(gp.buy_ins) AS buy) AS total_buy_ins,
          gp.cash_out
        FROM game_players gp
        INNER JOIN games g ON g.id = gp.game_id
        WHERE ($1::date IS NULL OR g.game_date >= $1::date)
          AND ($2::date IS NULL OR g.game_date <= $2::date)
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
    const overallStatsResult = await db.query(overallStatsQuery, [startDate, endDate]);
    const overallStats = overallStatsResult.rows;
    
    // Biggest winning night per player: per game profit = cash_out minus that game's total buy-ins.
    const biggestWinQuery = `
      WITH gp_with_sum AS (
        SELECT 
          gp.id, 
          gp.game_id, 
          gp.player_id, 
          (SELECT COALESCE(SUM(buy), 0) FROM unnest(gp.buy_ins) AS buy) AS total_buy_ins,
          gp.cash_out
        FROM game_players gp
        INNER JOIN games g ON g.id = gp.game_id
        WHERE ($1::date IS NULL OR g.game_date >= $1::date)
          AND ($2::date IS NULL OR g.game_date <= $2::date)
      )
      SELECT player_id, MAX(cash_out - total_buy_ins) AS biggest_win
      FROM gp_with_sum
      GROUP BY player_id;
    `;
    const biggestWinResult = await db.query(biggestWinQuery, [startDate, endDate]);
    const biggestWinMap = {};
    biggestWinResult.rows.forEach(row => {
      biggestWinMap[row.player_id] = row.biggest_win;
    });
    
    // Merge the two results into the stats array.
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

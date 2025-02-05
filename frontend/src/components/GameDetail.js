// frontend/src/components/GameDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    axios.get(`/api/games/${id}`)
      .then(response => setGame(response.data))
      .catch(error => console.error('Error fetching game detail:', error));
  }, [id]);

  if (!game) {
    return <p>Loading game details...</p>;
  }

  // Calculate overall totals
  let overallBuyIns = 0;
  let overallCashOut = 0;
  game.players.forEach(p => {
    const buyInSum = Array.isArray(p.buy_ins)
      ? p.buy_ins.reduce((acc, cur) => acc + parseInt(cur, 10), 0)
      : (parseInt(p.buy_ins, 10) || 0);
    overallBuyIns += buyInSum;
    overallCashOut += parseInt(p.cash_out, 10) || 0;
  });
  // Overall: Buy-In - Cash-Out (if negative, display in red)
  const overallProfit = overallBuyIns - overallCashOut;

  return (
    <div>
      <h2>Game Details (Read-Only)</h2>
      <p><strong>Date:</strong> {game.game_date}</p>
      <p><strong>Notes:</strong> {game.notes}</p>
      <h3>Players:</h3>
      {game.players && game.players.length > 0 ? (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Buy-Ins</th>
              <th>Cash-Out</th>
              <th>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {game.players.map((p, index) => {
              const buyInSum = Array.isArray(p.buy_ins)
                ? p.buy_ins.reduce((acc, cur) => acc + parseInt(cur, 10), 0)
                : (parseInt(p.buy_ins, 10) || 0);
              const cashOut = parseInt(p.cash_out, 10) || 0;
              const net = cashOut - buyInSum;
              return (
                <tr key={index}>
                  <td>{p.player_name}</td>
                  <td>{Array.isArray(p.buy_ins) ? p.buy_ins.join(', ') : p.buy_ins}</td>
                  <td>{p.cash_out}</td>
                  <td>{net}</td>
                </tr>
              );
            })}
            <tr style={{ fontWeight: 'bold' }}>
              <td>Overall</td>
              <td>{overallBuyIns}</td>
              <td>{overallCashOut}</td>
              <td style={{ color: overallProfit < 0 ? 'red' : 'black' }}>
                {overallProfit}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No players recorded.</p>
      )}
    </div>
  );
};

export default GameDetail;

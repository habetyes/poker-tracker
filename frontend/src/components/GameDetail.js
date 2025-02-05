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
              <th>Player ID</th>
              <th>Buy-Ins</th>
              <th>Cash-Out</th>
            </tr>
          </thead>
          <tbody>
            {game.players.map((p, index) => (
              <tr key={index}>
                <td>{p.player_id}</td>
                <td>{Array.isArray(p.buy_ins) ? p.buy_ins.join(', ') : p.buy_ins}</td>
                <td>{p.cash_out}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No players recorded.</p>
      )}
    </div>
  );
};

export default GameDetail;

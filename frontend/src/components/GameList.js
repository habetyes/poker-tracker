// frontend/src/components/GameList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GameList = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const fetchGames = () => {
    axios.get('/api/games', { headers: isAuthenticated ? { Authorization: `Bearer ${token}` } : {} })
      .then(response => setGames(response.data))
      .catch(error => console.error('Error fetching games:', error));
  };

  useEffect(() => {
    fetchGames();
  }, [isAuthenticated, token]);

  const handleEdit = (id) => {
    navigate(`/game-entry/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this game? This will result in data loss.")) {
      axios.delete(`/api/games/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          alert('Game deleted successfully.');
          fetchGames();
        })
        .catch(error => {
          console.error('Error deleting game:', error);
          alert('Error deleting game.');
        });
    }
  };

  return (
    <div>
      <h2>Game List</h2>
      {games.length === 0 ? (
        <p>No games found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date (click to view details)</th>
              <th>Notes</th>
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>{game.id}</td>
                <td>
                  <a href={`/game-detail/${game.id}`}>{game.game_date}</a>
                </td>
                <td>{game.notes}</td>
                {isAuthenticated && (
                  <td>
                    <button onClick={() => handleEdit(game.id)}>Edit</button>{' '}
                    <button onClick={() => handleDelete(game.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GameList;

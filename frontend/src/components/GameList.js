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
      <h2 className="mb-4">Game Management</h2>
      {games.length === 0 ? (
        <p>No games found.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Notes</th>
              <th>Total Buyins</th>
              {isAuthenticated && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>
                  <a href={`/game-detail/${game.id}`}>
                    {game.game_date.slice(0, 10)}
                  </a>
                </td>
                <td>{game.notes}</td>
                <td>{game.total_buyins}</td>
                {isAuthenticated && (
                  <td>
                    <button className="btn btn-sm btn-primary me-2" 
                    style={{ backgroundColor: 'transparent', border: 'none'}}
                    onClick={() => handleEdit(game.id)}>✍️</button>
                    <button 
                      className="btn btn-sm" 
                      style={{ backgroundColor: 'transparent', border: 'none' }}
                      onClick={() => handleDelete(game.id)}>
                      <span role="img" aria-label="delete">🗑️</span>
                    </button>
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

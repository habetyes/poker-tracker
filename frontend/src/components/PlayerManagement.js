// frontend/src/components/PlayerManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const token = sessionStorage.getItem('token');

  const fetchPlayers = () => {
    axios.get('/api/players')
      .then(response => setPlayers(response.data))
      .catch(error => console.error('Error fetching players:', error));
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) {
      alert('Please enter a player name.');
      return;
    }
    axios.post('/api/players', { name: newPlayerName }, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        alert('Player added successfully.');
        setNewPlayerName('');
        fetchPlayers();
      })
      .catch(error => {
        console.error('Error adding player:', error);
        alert('Error adding player.');
      });
  };

  const handleEditClick = (player) => {
    setEditingPlayerId(player.id);
    setEditedName(player.name);
  };

  const handleSaveEdit = (playerId) => {
    axios.put(`/api/players/${playerId}`, { name: editedName }, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        alert('Player updated successfully.');
        setEditingPlayerId(null);
        fetchPlayers();
      })
      .catch(error => {
        console.error('Error updating player:', error);
        alert('Error updating player.');
      });
  };

  const handleDeletePlayer = (id) => {
    if (window.confirm("Are you sure you want to delete this player? This will remove the player from all games.")) {
      axios.delete(`/api/players/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          alert('Player deleted successfully.');
          fetchPlayers();
        })
        .catch(error => {
          console.error('Error deleting player:', error);
          alert(error.response.data.message || 'Error deleting player.');
        });
    }
  };

  return (
    <div>
      <h2 className="mb-4">Player Management</h2>
      <form onSubmit={handleAddPlayer} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">Add Player</button>
        </div>
      </form>

      {players.length === 0 ? (
        <p>No players available.</p>
      ) : (
        <div className="row g-2">
          {players.map(player => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={player.id}>
              <div
                className="card h-100 d-flex flex-column"
                style={{
                  borderRadius: '50px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}
              >
                <div className="card-body d-flex flex-column align-items-center">
                  {editingPlayerId === player.id ? (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)}
                      />
                      <div>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleSaveEdit(player.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingPlayerId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title text-center mt-2">{player.name}</h5>
                      {/* We place a "spacer" div here to push buttons to the bottom */}
                      <div className="mt-auto w-100 d-flex justify-content-between">
                        <button
                          className="btn btn-link btn-sm"
                          onClick={() => handleEditClick(player)}
                        >
                          Edit
                        </button>
                        {player.can_delete && (
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => handleDeletePlayer(player.id)}
                            style={{ backgroundColor: 'transparent', border: 'none'}}
                            title="Delete player"
                          >
                            <span role="img" aria-label="delete">🗑️</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerManagement;

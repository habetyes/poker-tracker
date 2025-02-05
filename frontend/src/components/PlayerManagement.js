// frontend/src/components/PlayerManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const token = localStorage.getItem('token');

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
          alert('Error deleting player.');
        });
    }
  };

  return (
    <div>
      <h2>Player Management</h2>
      <form onSubmit={handleAddPlayer}>
        <label>Player Name: </label>
        <input
          type="text"
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          required
        />
        <button type="submit">Add Player</button>
      </form>
      <h3>Player List</h3>
      {players.length === 0 ? (
        <p>No players available.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>
                  {editingPlayerId === player.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                    />
                  ) : (
                    player.name
                  )}
                </td>
                <td>
                  {editingPlayerId === player.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(player.id)}>Save Changes</button>
                      <button onClick={() => setEditingPlayerId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(player)}>Edit</button>{' '}
                      <button onClick={() => handleDeletePlayer(player.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlayerManagement;

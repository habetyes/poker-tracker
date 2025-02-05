// frontend/src/components/GameEntry.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const GameEntry = () => {
  const { id } = useParams(); // if id exists, we are in edit mode
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Shared fields
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // In create mode: selectedPlayers will be an array of player IDs (as strings)
  // In edit mode: selectedPlayers is an array of objects: { playerId, buyIns, cashOut }
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]); // full player pool

  // For "Add Players" in edit mode (players to add)
  const [addingPlayers, setAddingPlayers] = useState(false);
  const [playersToAdd, setPlayersToAdd] = useState([]); // array of player IDs (as strings)

  // Fetch full player pool
  const fetchPlayers = () => {
    axios.get('/api/players')
      .then(response => setAllPlayers(response.data))
      .catch(error => console.error('Error fetching players:', error));
  };

  // In edit mode, fetch the existing game details
  useEffect(() => {
    fetchPlayers();
    if (id) {
      axios.get(`/api/games/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          const game = response.data;
          setDate(game.game_date);
          setNotes(game.notes || '');
          // Prepare selectedPlayers as objects
          const currentPlayers = game.players.map(gp => ({
            playerId: gp.player_id.toString(),
            buyIns: Array.isArray(gp.buy_ins) ? gp.buy_ins.join(',') : gp.buy_ins,
            cashOut: gp.cash_out
          }));
          setSelectedPlayers(currentPlayers);
        })
        .catch(error => console.error('Error fetching game details:', error));
    }
  }, [id, token]);

  // In create mode, fetch players (if not already loaded)
  useEffect(() => {
    if (!id) {
      fetchPlayers();
    }
  }, [id]);

  // --------------------------
  // CREATE MODE (no id provided)
  // --------------------------
  const handleTogglePlayer = (playerId) => {
    // Toggle selection in create mode: selectedPlayers is an array of player IDs (strings)
    if (selectedPlayers.includes(playerId.toString())) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== playerId.toString()));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId.toString()]);
    }
  };

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!date) {
      alert('Please select a date.');
      return;
    }
    // Prepare players payload: since we’re creating, default buyIns to an empty array and cashOut to 0.
    const playersData = selectedPlayers.map(pid => ({
      playerId: parseInt(pid, 10),
      buyIns: [],
      cashOut: 0
    }));
    const payload = { date, notes, players: playersData };
    axios.post('/api/games', payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        alert('Game created successfully!');
        const newGameId = response.data.gameId;
        // Redirect to edit mode for the new game
        navigate(`/game-entry/${newGameId}`);
      })
      .catch(error => {
        console.error('Error creating game:', error);
        alert('Error creating game.');
      });
  };

  // --------------------------
  // EDIT MODE (id is provided)
  // --------------------------
  // Remove a player from the game
  const handleRemovePlayer = (playerId) => {
    if (window.confirm("Are you sure you want to remove this player from the game?")) {
      setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== playerId.toString()));
    }
  };

  // Toggle selection for players to add (edit mode)
  const handleTogglePlayerToAdd = (playerId) => {
    if (playersToAdd.includes(playerId.toString())) {
      setPlayersToAdd(playersToAdd.filter(p => p !== playerId.toString()));
    } else {
      setPlayersToAdd([...playersToAdd, playerId.toString()]);
    }
  };

  // Add selected players from the "Add Players" section to the game without prompting for buy-ins.
  const handleAddSelectedPlayers = () => {
    const additions = playersToAdd.map(pid => ({
      playerId: pid,
      buyIns: [], // no prompt; default to empty
      cashOut: 0
    }));
    setSelectedPlayers([...selectedPlayers, ...additions]);
    setPlayersToAdd([]);
    setAddingPlayers(false);
  };

  // Handle updating (saving) the game in edit mode
  const handleSaveGame = (e) => {
    e.preventDefault();
    // Prepare players data from selectedPlayers (they already have buyIns and cashOut)
    const playersData = selectedPlayers.map(p => ({
      playerId: parseInt(p.playerId, 10),
      buyIns: p.buyIns.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)),
      cashOut: parseInt(p.cashOut, 10) || 0
    }));
    const payload = { date, notes, players: playersData };
    axios.put(`/api/games/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        alert('Game updated successfully!');
        navigate('/game-list');
      })
      .catch(error => {
        console.error('Error updating game:', error);
        alert('Error updating game.');
      });
  };

  // --------------------------
  // Render
  // --------------------------
  if (!id) {
    // Create Mode
    return (
      <div>
        <h2>Create New Game</h2>
        <form onSubmit={handleCreateGame}>
          <div>
            <label>Date: </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label>Game Name/Notes (optional): </label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Custom game name" />
          </div>
          <div>
            <h3>Select Players for Game</h3>
            {allPlayers.map(player => (
              <div key={player.id}>
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.id.toString())}
                  onChange={() => handleTogglePlayer(player.id)}
                />
                <span>{player.name}</span>
              </div>
            ))}
          </div>
          <button type="submit">Create Game</button>
        </form>
      </div>
    );
  } else {
    // Edit Mode
    return (
      <div>
        <h2>Edit Game</h2>
        <form onSubmit={handleSaveGame}>
          {/* Display the date as read-only text */}
          <div>
            <p><strong>Date:</strong> {date}</p>
          </div>
          <div>
            <label>Game Name/Notes (optional): </label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Custom game name" />
          </div>
          <div>
            <h3>Players in This Game</h3>
            {selectedPlayers.length === 0 ? (
              <p>No players added yet.</p>
            ) : (
              selectedPlayers.map((p, index) => {
                const playerInfo = allPlayers.find(pl => pl.id.toString() === p.playerId);
                return (
                  <div key={p.playerId} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '5px' }}>
                    <strong>{playerInfo ? playerInfo.name : 'Unknown Player'}</strong>
                    <button type="button" onClick={() => handleRemovePlayer(p.playerId)} style={{ marginLeft: '10px' }}>
                      Remove Player
                    </button>
                    <div>
                      <label>Buy-Ins (comma-separated): </label>
                      <input
                        type="text"
                        value={p.buyIns}
                        onChange={e => {
                          const newPlayers = [...selectedPlayers];
                          newPlayers[index].buyIns = e.target.value;
                          setSelectedPlayers(newPlayers);
                        }}
                        placeholder="e.g. 10,20"
                      />
                    </div>
                    <div>
                      <label>Cash-Out: </label>
                      <input
                        type="number"
                        value={p.cashOut}
                        onChange={e => {
                          const newPlayers = [...selectedPlayers];
                          newPlayers[index].cashOut = e.target.value;
                          setSelectedPlayers(newPlayers);
                        }}
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div>
            <button type="button" onClick={() => setAddingPlayers(!addingPlayers)}>
              {addingPlayers ? 'Cancel Adding Players' : 'Add Players'}
            </button>
            {addingPlayers && (
              <div style={{ border: '1px solid #aaa', padding: '10px', marginTop: '10px' }}>
                <h4>Select Players to Add</h4>
                {allPlayers
                  .filter(player => !selectedPlayers.find(p => p.playerId === player.id.toString()))
                  .map(player => (
                    <div key={player.id}>
                      <input
                        type="checkbox"
                        checked={playersToAdd.includes(player.id.toString())}
                        onChange={() => handleTogglePlayerToAdd(player.id)}
                      />
                      <span>{player.name}</span>
                    </div>
                  ))
                }
                <button type="button" onClick={handleAddSelectedPlayers}>Add Selected Players</button>
              </div>
            )}
          </div>
          <button type="submit">Save Game</button>
        </form>
      </div>
    );
  }
};

export default GameEntry;

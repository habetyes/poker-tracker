// frontend/src/components/GameEntry.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const GameEntry = () => {
  const { id } = useParams(); // if id exists, we are in edit mode; otherwise, create mode.
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Shared state for both modes
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // In create mode: selectedPlayers is an array of player IDs (as strings).
  // (In edit mode, selectedPlayers would be an array of objects – this file implements both modes.)
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);

  // For edit mode: additional players to add
  const [addingPlayers, setAddingPlayers] = useState(false);
  const [playersToAdd, setPlayersToAdd] = useState([]);

  // Fetch full player pool
  const fetchPlayers = () => {
    axios.get('/api/players')
      .then(response => setAllPlayers(response.data))
      .catch(error => console.error('Error fetching players:', error));
  };

  useEffect(() => {
    fetchPlayers();
    if (id) {
      // Edit mode: fetch game details
      axios.get(`/api/games/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          const game = response.data;
          setDate(game.game_date);
          setNotes(game.notes || '');
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

  useEffect(() => {
    if (!id) {
      fetchPlayers();
    }
  }, [id]);

  // --------------------------
  // CREATE MODE FUNCTIONS
  // --------------------------
  const togglePlayerSelection = (playerId) => {
    // In create mode, selectedPlayers is an array of strings.
    const pid = playerId.toString();
    setSelectedPlayers(prevSelected => {
      if (prevSelected.includes(pid)) {
        return prevSelected.filter(p => p !== pid);
      } else {
        return [...prevSelected, pid];
      }
    });
  };

  const clearSelections = () => {
    setSelectedPlayers([]);
  };

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!date) {
      alert('Please select a date.');
      return;
    }
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
        navigate(`/game-entry/${newGameId}`);
      })
      .catch(error => {
        console.error('Error creating game:', error);
        alert('Error creating game.');
      });
  };

  // --------------------------
  // EDIT MODE FUNCTIONS
  // --------------------------
  const handleSaveGame = (e) => {
    e.preventDefault();
    // In edit mode, selectedPlayers is an array of objects.
    const playersData = selectedPlayers.map(p => ({
      playerId: parseInt(p.playerId, 10),
      buyIns: p.buyIns ? p.buyIns.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [],
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

  const handleRemovePlayer = (playerId) => {
    if (window.confirm("Are you sure you want to remove this player from the game?")) {
      setSelectedPlayers(prevSelected => prevSelected.filter(p => p.playerId !== playerId.toString()));
    }
  };

  const togglePlayerToAdd = (playerId) => {
    const pid = playerId.toString();
    setPlayersToAdd(prev => {
      if (prev.includes(pid)) {
        return prev.filter(p => p !== pid);
      } else {
        return [...prev, pid];
      }
    });
  };

  const handleAddNewPlayers = () => {
    const additions = playersToAdd.map(pid => ({
      playerId: pid,
      buyIns: '',
      cashOut: 0
    }));
    setSelectedPlayers(prev => [...prev, ...additions]);
    setPlayersToAdd([]);
    setAddingPlayers(false);
  };

  // --------------------------
  // RENDERING
  // --------------------------
  if (!id) {
    // CREATE MODE
    return (
      <div>
        <h2>Create New Game</h2>
        <form onSubmit={handleCreateGame}>
          <div className="mb-3" onClick={() => document.getElementById("game-date-input").focus()}>
            <label htmlFor="game-date-input" className="form-label">Date:</label>
            <input
              id="game-date-input"
              type="date"
              className="form-control"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Game Name/Notes (optional):</label>
            <input
              type="text"
              className="form-control"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Custom game name"
            />
          </div>
          <h3>Select Players for Game</h3>
          <div className="row g-2">
            {allPlayers.map(player => {
              const isSelected = selectedPlayers.includes(player.id.toString());
              return (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={player.id}>
                  <div
                    className={`custom-card ${isSelected ? 'selected-card' : ''}`}
                    onClick={() => togglePlayerSelection(player.id)}
                  >
                    <div className="card-body d-flex flex-column justify-content-center align-items-center">
                      <h5 className="card-title text-center">{player.name}</h5>
                      {isSelected && <span className="checkmark">&#10003;</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3">
            <button type="button" className="btn btn-secondary me-2" onClick={clearSelections}>Clear Selections</button>
            <button type="submit" className="btn btn-primary">Create Game</button>
          </div>
        </form>
      </div>
    );
  } else {
    // EDIT MODE
    return (
      <div>
        <h2>Edit Game</h2>
        <form onSubmit={handleSaveGame}>
          <div className="mb-3">
            <label className="form-label">Date:</label>
            <p className="form-control-plaintext">{date ? date.slice(0, 10) : ''}</p>
          </div>
          <div className="mb-3">
            <label className="form-label">Game Name/Notes (optional):</label>
            <input
              type="text"
              className="form-control"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Custom game name"
            />
          </div>
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => setAddingPlayers(!addingPlayers)}
            >
              {addingPlayers ? 'Cancel Adding Players' : 'Add Players'}
            </button>
            <button type="submit" className="btn btn-primary">
              Save Game
            </button>
          </div>
          <h3>Players in This Game</h3>
          <div className="row g-2">
            {selectedPlayers.length === 0 ? (
              <p>No players added yet.</p>
            ) : (
              selectedPlayers.map((p, index) => {
                const playerInfo = allPlayers.find(
                  pl => pl.id.toString() === p.playerId
                );
                return (
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.playerId}>
                    <div
                      className="card h-100"
                      style={{
                        borderRadius: '50px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className="card-body d-flex flex-column justify-content-between"
                        style={{ height: '100%' }}
                      >
                        <div>
                          <h5 className="card-title text-center mt-2">
                            {playerInfo ? playerInfo.name : 'Unknown Player'}
                          </h5>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div style={{ width: '48%' }}>
                            <label className="form-label d-block text-center">Buy-In:</label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              className="form-control"
                              value={p.buyIns}
                              onChange={e => {
                                const newPlayers = [...selectedPlayers];
                                newPlayers[index].buyIns = e.target.value;
                                setSelectedPlayers(newPlayers);
                              }}
                              placeholder="e.g. 10"
                            />
                          </div>
                          <div style={{ width: '48%' }}>
                            <label className="form-label d-block text-center">Cash-Out:</label>
                            <input
                              type="number"
                              className="form-control"
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
                        <div className="d-flex justify-content-between mt-2">
                          <button type="button" className="btn btn-link btn-sm" onClick={() => {}}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm"
                            onClick={() => handleRemovePlayer(p.playerId)}
                            style={{ backgroundColor: 'transparent', border: 'none', color: 'red' }}
                            title="Remove player"
                          >
                            <span role="img" aria-label="delete">🗑️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {addingPlayers && (
            <div className="row g-2 mt-2">
              {allPlayers
                .filter(player => !selectedPlayers.find(p => p.playerId === player.id.toString()))
                .map(player => (
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={player.id}>
                    <div
                      className={`custom-card h-100 ${playersToAdd.includes(player.id.toString()) ? 'selected-card' : ''}`}
                      onClick={() => togglePlayerToAdd(player.id)}
                      style={{
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                      }}
                    >
                      <div className="card-body d-flex flex-column justify-content-center align-items-center">
                        <h5 className="card-title text-center">{player.name}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              <div className="col-12">
                <button type="button" className="btn btn-primary mt-2" onClick={handleAddNewPlayers}>
                  Add Selected Players
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }
};

export default GameEntry;

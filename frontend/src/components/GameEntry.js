// frontend/src/components/GameEntry.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const GameEntry = () => {
  const { id } = useParams(); // if present, editing an existing game
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [allPlayers, setAllPlayers] = useState([]); // complete player pool
  const [selectedPlayers, setSelectedPlayers] = useState([]); // players for this game: { playerId, buyIns, cashOut }
  const [newPlayerName, setNewPlayerName] = useState('');

  // Fetch all players from the pool
  const fetchPlayers = () => {
    axios.get('/api/players')
      .then(response => setAllPlayers(response.data))
      .catch(error => console.error('Error fetching players:', error));
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // If editing, fetch game details
  useEffect(() => {
    if (id) {
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

  // Toggle selection of a player (for new game creation or adding late players)
  const togglePlayerSelection = (playerId) => {
    const exists = selectedPlayers.find(p => p.playerId === playerId.toString());
    if (exists) {
      // Unselect player
      setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== playerId.toString()));
    } else {
      // Add player with default buyIns and cashOut
      setSelectedPlayers([...selectedPlayers, { playerId: playerId.toString(), buyIns: '', cashOut: 0 }]);
    }
  };

  // Update buyIns or cashOut for a selected player
  const handlePlayerDataChange = (index, field, value) => {
    const newData = [...selectedPlayers];
    newData[index][field] = value;
    setSelectedPlayers(newData);
  };

  // Remove a player from the game
  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== playerId.toString()));
  };

  // Add a new player to the pool directly from this screen
  const handleAddNewPlayer = () => {
    if (!newPlayerName.trim()) {
      alert('Enter a name.');
      return;
    }
    axios.post('/api/players', { name: newPlayerName }, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        alert('Player added.');
        setNewPlayerName('');
        fetchPlayers();
      })
      .catch(error => {
        console.error('Error adding new player:', error);
        alert('Error adding player.');
      });
  };

  // Handle game form submission (create or update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const playersData = selectedPlayers.map(p => ({
      playerId: parseInt(p.playerId, 10),
      buyIns: p.buyIns.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)),
      cashOut: parseInt(p.cashOut, 10) || 0
    }));
    const payload = { date, notes, players: playersData };

    if (id) {
      axios.put(`/api/games/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          alert('Game updated successfully!');
          navigate('/game-list');
        })
        .catch(error => {
          console.error('Error updating game:', error);
          alert('Error updating game.');
        });
    } else {
      axios.post('/api/games', payload, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          alert('Game created successfully!');
          navigate('/game-list');
        })
        .catch(error => {
          console.error('Error creating game:', error);
          alert('Error creating game.');
        });
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Game' : 'Create New Game'}</h2>
      <form onSubmit={handleSubmit}>
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
                checked={!!selectedPlayers.find(p => p.playerId === player.id.toString())}
                onChange={() => togglePlayerSelection(player.id)}
              />
              <span>{player.name}</span>
            </div>
          ))}
        </div>
        {selectedPlayers.length > 0 && (
          <div>
            <h3>Player Details for This Game</h3>
            {selectedPlayers.map((p, index) => {
              const playerInfo = allPlayers.find(pl => pl.id.toString() === p.playerId);
              return (
                <div key={p.playerId} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '5px' }}>
                  <strong>{playerInfo ? playerInfo.name : 'Unknown Player'}</strong>
                  <button type="button" onClick={() => handleRemovePlayer(p.playerId)} style={{ marginLeft: '10px' }}>
                    Remove from game
                  </button>
                  <div>
                    <label>Buy-Ins (comma-separated): </label>
                    <input
                      type="text"
                      value={p.buyIns}
                      onChange={e => handlePlayerDataChange(index, 'buyIns', e.target.value)}
                      placeholder="e.g. 10,20"
                    />
                  </div>
                  <div>
                    <label>Cash-Out: </label>
                    <input
                      type="number"
                      value={p.cashOut}
                      onChange={e => handlePlayerDataChange(index, 'cashOut', e.target.value)}
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button type="submit">{id ? 'Update Game' : 'Create Game'}</button>
      </form>
      <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <h3>Add New Player to Pool</h3>
        <input
          type="text"
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          placeholder="New player name"
        />
        <button onClick={handleAddNewPlayer}>Add Player</button>
      </div>
    </div>
  );
};

export default GameEntry;

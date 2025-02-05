// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import GameEntry from './components/GameEntry';
import GameList from './components/GameList';
import PlayerManagement from './components/PlayerManagement';
import GameDetail from './components/GameDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);
  
  return (
    <div className="container" style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/">Dashboard</Link> |{' '}
        <Link to="/login">Host Login</Link> |{' '}
        {isAuthenticated && (
          <>
            <Link to="/game-entry">Add/Edit Game</Link> |{' '}
            <Link to="/player-management">Player Management</Link> |{' '}
          </>
        )}
        <Link to="/game-list">Game List</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/game-entry" element={<GameEntry />} />
        <Route path="/game-entry/:id" element={<GameEntry />} />
        <Route path="/game-list" element={<GameList />} />
        <Route path="/player-management" element={<PlayerManagement />} />
        <Route path="/game-detail/:id" element={<GameDetail />} />
      </Routes>
    </div>
  );
}

export default App;

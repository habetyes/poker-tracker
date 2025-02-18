// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import GameEntry from './components/GameEntry';
import GameList from './components/GameList';
import PlayerManagement from './components/PlayerManagement';
import GameDetail from './components/GameDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Logout function: removes token and updates state
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/'); // Redirect to home after logout
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <NavLink className="navbar-brand" to="/">Poker Tracker</NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Left-aligned navigation items */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Dashboard</NavLink>
              </li>
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/game-entry">Add Game</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/player-management">Player Management</NavLink>
                  </li>
                </>
              )}
              <li className="nav-item">
                <NavLink className="nav-link" to="/game-list">Game Management</NavLink>
              </li>
            </ul>
            {/* Right-aligned authentication button */}
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                {isAuthenticated ? (
                  <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                ) : (
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container">
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
    </div>
  );
}

export default App;

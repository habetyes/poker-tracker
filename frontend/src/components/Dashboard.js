// frontend/src/components/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'descending' });

  // New state variables for date filtering
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Function to fetch stats, optionally with date filters applied via query params.
  const fetchStats = () => {
    let url = '/api/stats';
    const params = [];
    if (filterStart) params.push(`start_date=${filterStart}`);
    if (filterEnd) params.push(`end_date=${filterEnd}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    axios.get(url)
      .then(response => setStats(response.data))
      .catch(error => console.error('Error fetching stats:', error));
  };

  // Fetch stats when the component mounts (all-time data by default)
  useEffect(() => {
    fetchStats();
  }, []);

  // Handler for applying the date filter once the user clicks the button.
  const applyFilters = (event) => {
    event.preventDefault();
    fetchStats();
  };

  // Update requestSort so that a column clicked for the first time sorts descending.
  const requestSort = key => {
    if (sortConfig.key === key) {
      // Toggle between descending and ascending if the same column header is clicked again.
      setSortConfig({
        key,
        direction: sortConfig.direction === 'descending' ? 'ascending' : 'descending'
      });
    } else {
      // First click on a new column: default to descending.
      setSortConfig({ key, direction: 'descending' });
    }
  };

  // This memoized sorted array is computed based on the current sortConfig.
  const sortedStats = useMemo(() => {
    const sortableItems = [...stats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'descending' ? 1 : -1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'descending' ? -1 : 1;
        return 0;
      });
    }
    return sortableItems;
  }, [stats, sortConfig]);

  // Display an indicator arrow based on the sort direction.
  const getSortIndicator = key => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'descending' ? '▼' : '▲';
    }
    return '';
  };

  return (
    <div>
      <h2 className="mb-4">Player Performance Dashboard</h2>
      {/* Date Filter Section */}
      <form onSubmit={applyFilters} className="mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <label className="col-form-label">Start Date:</label>
          </div>
          <div className="col-auto">
            <input
              type="date"
              className="form-control"
              value={filterStart}
              onChange={e => setFilterStart(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <label className="col-form-label">End Date:</label>
          </div>
          <div className="col-auto">
            <input
              type="date"
              className="form-control"
              value={filterEnd}
              onChange={e => setFilterEnd(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary">
              Apply Filter
            </button>
          </div>
        </div>
      </form>

      {/* Dashboard Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
              Player Name {getSortIndicator('name')}
            </th>
            <th onClick={() => requestSort('totalBuyIns')} style={{ cursor: 'pointer' }}>
              Total Buy-Ins {getSortIndicator('totalBuyIns')}
            </th>
            <th onClick={() => requestSort('totalCashOut')} style={{ cursor: 'pointer' }}>
              Total Cash-Out {getSortIndicator('totalCashOut')}
            </th>
            <th onClick={() => requestSort('netProfit')} style={{ cursor: 'pointer' }}>
              Net Profit {getSortIndicator('netProfit')}
            </th>
            <th onClick={() => requestSort('biggestWin')} style={{ cursor: 'pointer' }}>
              Biggest Win {getSortIndicator('biggestWin')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStats.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.totalBuyIns}</td>
              <td>{player.totalCashOut}</td>
              <td className={
                player.netProfit < 0 ? 'text-negative' : 
                player.netProfit > 0 ? 'text-positive' : ''
              }>{player.netProfit}</td>
              <td>{player.biggestWin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;

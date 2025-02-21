// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    axios.get('/api/stats')
      .then(response => setStats(response.data))
      .catch(error => console.error('Error fetching stats:', error));
  }, []);

  const sortedStats = React.useMemo(() => {
    let sortableItems = [...stats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [stats, sortConfig]);

  const requestSort = key => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = key => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  return (
    <div>
      <h2 className="mb-4">Player Performance Dashboard</h2>
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

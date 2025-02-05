import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get('/api/stats')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
      });
  }, []);

  return (
    <div>
      <h2>Player Performance Stats</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Total Buy-Ins</th>
            <th>Total Cash-Out</th>
            <th>Net Profit/Loss</th>
            <th>Biggest Win</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(player => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.totalBuyIns}</td>
              <td>{player.totalCashOut}</td>
              <td>{player.netProfit}</td>
              <td>{player.biggestWin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;

const db = require('../db');
const bcrypt = require('bcrypt');

const DEFAULT_HOST_USERNAME = 'host';
const DEFAULT_HOST_PASSWORD = 'password';

async function initHostUser() {
  try {
    const res = await db.query('SELECT * FROM users WHERE username = $1', [DEFAULT_HOST_USERNAME]);
    if (res.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(DEFAULT_HOST_PASSWORD, 10);
      await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [DEFAULT_HOST_USERNAME, hashedPassword]);
      console.log(`Default host user created with username: ${DEFAULT_HOST_USERNAME} and password: ${DEFAULT_HOST_PASSWORD}`);
    } else {
      console.log('Host user already exists.');
    }
  } catch (err) {
    console.error('Error initializing host user', err);
  }
}

module.exports = initHostUser;

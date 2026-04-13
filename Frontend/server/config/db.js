require('dotenv').config();
const mysql = require('mysql2');

/**
 * DATABASE CONNECTION POOL
 * Why use a "pool" instead of a single connection?
 * If 100 users hit your dashboard at once, a pool automatically creates multiple
 * parallel connections to the database to handle them efficiently without crashing!
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'subtrack_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// We wrap it in .promise() so we can use powerful modern JavaScript 'async/await' syntax!
module.exports = pool.promise();

console.log('Connecting to:', process.env.DATABASE_URL);

import pool from './db.js';

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected! Current time from DB:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end(); // Close the pool
  }
};

testConnection();

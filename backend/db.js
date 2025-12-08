const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment variables');
  // Don't exit in serverless - just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Create pool with connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Serverless-friendly settings
  max: 1, // Limit connections in serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Only test connection in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Connecting to database...');
  console.log('Database host:', process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]);
  
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection failed:', err.message);
    } else {
      console.log('Database connected successfully at:', res.rows[0].now);
    }
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

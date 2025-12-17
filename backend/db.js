const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment variables');
  process.exit(1);
}

console.log('Connecting to database...');

// Extract and log connection details for debugging
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log('Database host:', url.hostname);
  console.log('Database port:', url.port);
  console.log('Database name:', url.pathname.substring(1));
} catch (error) {
  console.error('Error parsing DATABASE_URL:', error.message);
  console.log('Raw DATABASE_URL format:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

// Handle special characters in connection string
let connectionConfig;
try {
  // Try to parse as URL first
  const url = new URL(process.env.DATABASE_URL);
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} catch (urlError) {
  console.log('URL parsing failed, using connectionString directly');
  // If URL parsing fails due to special characters, use connectionString directly
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
}

const pool = new Pool({
  ...connectionConfig,
  // Connection options to improve reliability on Render
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Error code:', err.code);
    console.error('Error details:', err);
    
    // Don't exit the process, let the app start anyway
    // Some routes might work without database
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

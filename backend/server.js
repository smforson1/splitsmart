const express = require('express');
const cors = require('cors');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before routes to avoid import issues)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SplitSmart API is running' });
});

// Import routes (wrapped in try-catch for better error handling)
try {
  const authRouter = require('./routes/auth');
  const groupsRouter = require('./routes/groups');
  const membersRouter = require('./routes/members');
  const expensesRouter = require('./routes/expenses');
  const balancesRouter = require('./routes/balances');
  const settlementsRouter = require('./routes/settlements');
  const scanRouter = require('./routes/scan');

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/groups', groupsRouter);
  app.use('/api/members', membersRouter);
  app.use('/api/expenses', expensesRouter);
  app.use('/api/balances', balancesRouter);
  app.use('/api/settlements', settlementsRouter);
  app.use('/api/expenses/scan', scanRouter);
} catch (error) {
  console.error('Error loading routes:', error);
  // Add a catch-all error route
  app.use('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization error',
      message: error.message 
    });
  });
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

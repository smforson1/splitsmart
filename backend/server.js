const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRouter = require('./routes/auth');
const groupsRouter = require('./routes/groups');
const membersRouter = require('./routes/members');
const expensesRouter = require('./routes/expenses');
const balancesRouter = require('./routes/balances');
const settlementsRouter = require('./routes/settlements');
const scanRouter = require('./routes/scan');
const invitesRouter = require('./routes/invites');
const notificationsRouter = require('./routes/notifications');
const recurringRouter = require('./routes/recurring');
const activityRouter = require('./routes/activity');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SplitSmart API is running' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/members', membersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/balances', balancesRouter);
app.use('/api/settlements', settlementsRouter);
app.use('/api/expenses/scan', scanRouter);
app.use('/api/invites', invitesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/activities', activityRouter);
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/expenses/:expenseId/comments', require('./routes/comments'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


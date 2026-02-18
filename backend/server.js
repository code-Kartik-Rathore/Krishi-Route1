require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/calculateProfit'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Krishi-Route API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Krishi-Route backend server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import models
const { User, Game, Post, Comment, Like } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Game Forum API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test database connection and models
app.get('/api/test-db', async (req, res) => {
  try {
    // Test creating a sample user (won't save due to validation)
    const sampleUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Test model validation
    await sampleUser.validate();
    
    res.json({
      message: 'Database models are working correctly!',
      models: ['User', 'Game', 'Post', 'Comment', 'Like'],
      status: 'All models loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Model test failed',
      message: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

module.exports = app;
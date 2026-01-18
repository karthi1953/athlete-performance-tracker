// backend/routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const Athlete = require('../models/Athlete');
const Test = require('../models/Test');
const Score = require('../models/Score');
const { calculateLeaderboard } = require('../utils/scoreCalculator'); // This import

// GET leaderboard
router.get('/', async (req, res) => {
  try {
    console.log('Fetching leaderboard data...');
    
    // Fetch all data needed for calculation
    const [athletes, tests, scores] = await Promise.all([
      Athlete.find(),
      Test.find(),
      Score.find()
        .populate('athleteId', 'name')
        .populate('testId', 'testName unit higherIsBetter')
    ]);
    
    console.log(`Data loaded: ${athletes.length} athletes, ${tests.length} tests, ${scores.length} scores`);
    
    // Check if the function exists
    if (typeof calculateLeaderboard !== 'function') {
      throw new Error('calculateLeaderboard function not found');
    }
    
    // Calculate leaderboard
    const leaderboard = calculateLeaderboard(athletes, tests, scores);
    
    console.log(`Leaderboard calculated with ${leaderboard.length} ranked athletes`);
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate leaderboard',
      details: error.message 
    });
  }
});

// GET leaderboard with optional date range
router.get('/filter', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let scoreQuery = {};
    
    // Apply date filters if provided
    if (startDate || endDate) {
      scoreQuery.date = {};
      if (startDate) scoreQuery.date.$gte = new Date(startDate);
      if (endDate) scoreQuery.date.$lte = new Date(endDate);
    }
    
    const [athletes, tests, scores] = await Promise.all([
      Athlete.find(),
      Test.find(),
      Score.find(scoreQuery)
        .populate('athleteId', 'name')
        .populate('testId', 'testName unit higherIsBetter')
    ]);
    
    const leaderboard = calculateLeaderboard(athletes, tests, scores);
    res.json(leaderboard);
  } catch (error) {
    console.error('Filtered leaderboard error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
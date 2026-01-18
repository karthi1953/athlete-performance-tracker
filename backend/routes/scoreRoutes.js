// backend/routes/scoreRoutes.js
const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Athlete = require('../models/Athlete');
const Test = require('../models/Test');

// CREATE or UPDATE - Record a new test score (upsert)
router.post('/', async (req, res) => {
  try {
    const { athleteId, testId, value, date } = req.body;
    
    // Validate athlete exists
    const athlete = await Athlete.findById(athleteId);
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    // Validate test exists
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Parse date (default to today if not provided)
    const scoreDate = date ? new Date(date) : new Date();
    // Normalize date to beginning of day for comparison
    scoreDate.setHours(0, 0, 0, 0);

    // Check if score already exists for this athlete+test+date
    const existingScore = await Score.findOne({
      athleteId,
      testId,
      date: {
        $gte: new Date(scoreDate.getFullYear(), scoreDate.getMonth(), scoreDate.getDate()),
        $lt: new Date(scoreDate.getFullYear(), scoreDate.getMonth(), scoreDate.getDate() + 1)
      }
    });

    let score;
    let isUpdate = false;

if (existingScore) {
  existingScore.value = value;
  score = await existingScore.save();
  isUpdate = true;
} else {
  // Create new score
  score = new Score({
    athleteId,
    testId,
    value,
    date: scoreDate
  });
  await score.save();
}

    // Populate references for better response
    await score.populate('athleteId', 'name');
    await score.populate('testId', 'testName unit');
    
    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate ? 'Score updated successfully' : 'Score recorded successfully',
      isUpdate,
      score
    });
    
  } catch (error) {
    console.error('Score save error:', error);
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all scores (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { athleteId, testId, limit, date } = req.query;
    let query = {};
    
    if (athleteId) query.athleteId = athleteId;
    if (testId) query.testId = testId;
    
    // Handle date filtering
    if (date) {
      const filterDate = new Date(date);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: filterDate,
        $lt: nextDay
      };
    }
    
    let scoresQuery = Score.find(query)
      .populate('athleteId', 'name')
      .populate('testId', 'testName unit')
      .sort({ date: -1, createdAt: -1 });
    
    if (limit) scoresQuery = scoresQuery.limit(parseInt(limit));
    
    const scores = await scoresQuery;
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get scores for a specific athlete
router.get('/athlete/:athleteId', async (req, res) => {
  try {
    const scores = await Score.find({ athleteId: req.params.athleteId })
      .populate('testId', 'testName unit')
      .sort({ date: -1 });
    
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get scores for a specific test
router.get('/test/:testId', async (req, res) => {
  try {
    const scores = await Score.find({ testId: req.params.testId })
      .populate('athleteId', 'name')
      .sort({ value: 1 }); // Sort by value (ascending)
    
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update a score by ID
router.put('/:id', async (req, res) => {
  try {
    const score = await Score.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('athleteId', 'name')
    .populate('testId', 'testName unit');
    
    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }
    res.json(score);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Delete a score by ID
router.delete('/:id', async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
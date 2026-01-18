// routes/athleteRoutes.js
const express = require('express');
const router = express.Router();
const Athlete = require('../models/Athlete');
const Score = require('../models/Score');
// CREATE - Add a new athlete
router.post('/', async (req, res) => {
  try {
    const athlete = new Athlete(req.body);
    await athlete.save();
    res.status(201).json(athlete);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all athletes
router.get('/', async (req, res) => {
  try {
    const athletes = await Athlete.find().sort({ createdAt: -1 });
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get single athlete by ID
router.get('/:id', async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    res.json(athlete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update athlete by ID
router.put('/:id', async (req, res) => {
  try {
    const athlete = await Athlete.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    res.json(athlete);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const athleteId = req.params.id;
    
    // First, delete all scores for this athlete
    await Score.deleteMany({ athleteId: athleteId });
    
    // Then delete the athlete
    const athlete = await Athlete.findByIdAndDelete(athleteId);
    
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    
    res.json({ 
      message: 'Athlete and all associated scores deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
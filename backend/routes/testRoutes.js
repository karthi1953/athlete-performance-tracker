const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

router.post('/', async (req, res) => {
  try {
    const test = new Test(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all test types
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find().sort({ testName: 1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get single test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update test by ID
router.put('/:id', async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Delete test by ID
router.delete('/:id', async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
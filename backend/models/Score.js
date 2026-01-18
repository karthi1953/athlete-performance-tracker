const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  athleteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Athlete',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

scoreSchema.index({ athleteId: 1, testId: 1, date: 1 });

module.exports = mongoose.model('Score', scoreSchema);
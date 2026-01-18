const mongoose = require('mongoose');

const athleteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['coach', 'viewer'],
    default: 'viewer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Athlete', athleteSchema);
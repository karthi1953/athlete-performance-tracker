const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  higherIsBetter: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', testSchema);
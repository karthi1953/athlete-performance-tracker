// server.js (updated)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes
const athleteRoutes = require('./routes/athleteRoutes');
const testRoutes = require('./routes/testRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/scores', scoreRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Athlete Performance Tracker API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
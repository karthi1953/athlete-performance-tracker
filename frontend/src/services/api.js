// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Athlete API calls
export const athleteAPI = {
  getAll: () => api.get('/athletes'),
  getById: (id) => api.get(`/athletes/${id}`),
  create: (athleteData) => api.post('/athletes', athleteData),
  update: (id, athleteData) => api.put(`/athletes/${id}`, athleteData),
  delete: (id) => api.delete(`/athletes/${id}`),
};

// Test API calls
export const testAPI = {
  getAll: () => api.get('/tests'),
  create: (testData) => api.post('/tests', testData),
};

// Score API calls
export const scoreAPI = {
  getAll: (params) => api.get('/scores', { params }),
  create: (scoreData) => api.post('/scores', scoreData),
  getByAthlete: (athleteId) => api.get(`/scores/athlete/${athleteId}`),
};

// Leaderboard API calls
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
  getFiltered: (params) => api.get('/leaderboard/filter', { params }),
};

export default api;
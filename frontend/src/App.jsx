import React, { useState, useEffect } from 'react';
import './App.css';
import { athleteAPI, testAPI, leaderboardAPI } from './services/api';
import AthleteList from './components/AthleteList';
import ScoreInput from './components/ScoreInput';
import TestManager from './components/TestManager';
import Leaderboard from './components/Leaderboard';
function App() {
  const [athletes, setAthletes] = useState([]);
  const [tests, setTests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); 

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [athletesRes, testsRes, leaderboardRes] = await Promise.all([
        athleteAPI.getAll(),
        testAPI.getAll(),
        leaderboardAPI.get()
      ]);
      
      setAthletes(athletesRes.data);
      setTests(testsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    try {
      const res = await leaderboardAPI.get();
      setLeaderboard(res.data);
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading Athletes Performance Tracker...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>Athletes Performance Tracker</h1>
          <button 
            className="btn-refresh"
            onClick={fetchInitialData}
            disabled={loading}
            title="Refresh all data"
          >
            🔄 Refresh
          </button>
        </div>
        <nav className="nav">
          <button onClick={() => setActiveView('dashboard')}>Dashboard</button>
          <button onClick={() => setActiveView('athletes')}>Athletes</button>
          <button onClick={() => setActiveView('tests')}>Tests</button>
          <button onClick={() => setActiveView('scores')}>Input Scores</button>
          <button onClick={() => setActiveView('leaderboard')}>Leaderboard</button>
        </nav>
      </header>

      <main className="main-content">
        {activeView === 'dashboard' && (
          <div className="dashboard">
            <h2>Dashboard Overview</h2>
            <div className="stats">
              <div className="stat-card">
                <h3>Athletes</h3>
                <p className="stat-number">{athletes.length}</p>
              </div>
              <div className="stat-card">
                <h3>Test Types</h3>
                <p className="stat-number">{tests.length}</p>
              </div>
              <div className="stat-card">
                <h3>Top Performer</h3>
                <p className="stat-number">
                  {leaderboard.length > 0 ? leaderboard[0].name : 'None'}
                </p>
              </div>
            </div>
            
            <div className="quick-actions">
              <button onClick={() => setActiveView('scores')}>📝 Input New Scores</button>
            </div>
          </div>
        )}

          {activeView === 'leaderboard' && (
            <div className="leaderboard-view">
              <Leaderboard />
            </div>
          )}
          {activeView === 'athletes' && (
            <div className="athletes-view">
              <h2>Athlete Management</h2>
              <AthleteList 
                athletes={athletes}
                onAthletesUpdated={(updatedAthletes) => {
                  setAthletes(updatedAthletes);
                  // Refresh leaderboard since athlete data changed
                  refreshLeaderboard();
                }}
              />
            </div>
          )}

        {activeView === 'tests' && (
          <div className="tests-view">
            <h2>Test Types Management</h2>
            <TestManager 
              onTestsUpdated={(updatedTests) => {
                setTests(updatedTests);
              }}
            />
          </div>
        )}

      {activeView === 'scores' && (
        <div className="scores-view">
          <div className="scores-header">
            <h2>Input Test Scores</h2>
          </div>
          
          <ScoreInput 
            onScoreAdded={(newScore) => {
              refreshLeaderboard();
            }}
          />
          
          <div className="scores-info">
            <h3>📊 How Scoring Works</h3>
            <p>
              Scores are normalized across all athletes for each test type. 
              The leaderboard ranks athletes based on the sum of their normalized scores.
            </p>
            <ul>
              <li>For tests where <strong>lower is better</strong> (like sprint time): Faster = More points</li>
              <li>For tests where <strong>higher is better</strong> (like vertical jump): Higher = More points</li>
              <li>Each test contributes up to 100 points</li>
              <li>Athlete's total score = Sum of all test points</li>
            </ul>
          </div>
        </div>
      )}
      </main>

      <footer className="app-footer">
        <p>Athlete Performance Tracker MVP • Simple role-based access (Coach/Viewer)</p>
      </footer>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import './App.css';
import { athleteAPI, testAPI, leaderboardAPI } from './services/api';
import AthleteList from './components/AthleteList';
import ScoreInput from './components/ScoreInput';
import TestManager from './components/TestManager';
import Leaderboard from './components/Leaderboard';
import AthleteForm from './components/AthleteForm';

function App() {
  const [athletes, setAthletes] = useState([]);
  const [tests, setTests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Handle deleting an athlete
  const handleDeleteAthlete = async (athleteId) => {
    try {
      await athleteAPI.delete(athleteId);
      // Remove the athlete from the local state
      const updatedAthletes = athletes.filter(athlete => athlete._id !== athleteId);
      setAthletes(updatedAthletes);
      
      // Refresh leaderboard since athlete data changed
      refreshLeaderboard();
      
      alert('Athlete deleted successfully');
    } catch (error) {
      console.error('Error deleting athlete:', error);
      alert('Failed to delete athlete');
    }
  };

  // Handle editing an athlete - show the form
  const handleEditAthlete = (athlete) => {
    console.log('Starting edit for athlete:', athlete._id || athlete.id, athlete.name);
    setEditingAthlete(athlete);
    setIsEditing(true);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    console.log('Canceling edit');
    setEditingAthlete(null);
    setIsEditing(false);
  };

  // Handle updating an athlete - FIXED VERSION
  const handleUpdateAthlete = async (updatedAthleteData) => {
    try {
      if (!editingAthlete || (!editingAthlete._id && !editingAthlete.id)) {
        alert('No athlete selected for editing');
        return;
      }
      
      const athleteId = editingAthlete._id || editingAthlete.id;
      console.log('Updating athlete with ID:', athleteId, 'Data:', updatedAthleteData);
      
      // Get current athletes for debugging
      console.log('Current athletes before update:', athletes.map(a => ({id: a._id, name: a.name})));
      
      const response = await athleteAPI.update(athleteId, updatedAthleteData);
      console.log('API response:', response.data);
      
      // Update the athlete in local state - IMPORTANT FIX
      const updatedAthletes = athletes.map(athlete => {
        const currentId = athlete._id || athlete.id;
        console.log('Checking athlete:', currentId, athlete.name);
        
        if (currentId === athleteId) {
          console.log('Found match! Updating:', athlete.name, '->', updatedAthleteData.name);
          return response.data; // Use the data returned from API
        }
        return athlete; // Return unchanged athlete
      });
      
      console.log('Updated athletes:', updatedAthletes.map(a => ({id: a._id, name: a.name})));
      
      setAthletes(updatedAthletes);
      setEditingAthlete(null);
      setIsEditing(false);
      refreshLeaderboard();
      
      alert(`Athlete "${updatedAthleteData.name}" updated successfully`);
    } catch (error) {
      console.error('Error updating athlete:', error);
      alert('Failed to update athlete: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle adding a new athlete
  const handleAddAthlete = async (athleteData) => {
    try {
      console.log('Adding new athlete:', athleteData);
      const response = await athleteAPI.create(athleteData);
      const updatedAthletes = [...athletes, response.data];
      setAthletes(updatedAthletes);
      refreshLeaderboard();
      alert(`Athlete "${athleteData.name}" added successfully`);
    } catch (error) {
      console.error('Error adding athlete:', error);
      alert('Failed to add athlete');
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

        </div>
        <nav className="nav">
          <button onClick={() => {
            setActiveView('dashboard');
            setIsEditing(false);
            setEditingAthlete(null);
          }}>Dashboard</button>
          <button onClick={() => {
            setActiveView('athletes');
            setIsEditing(false);
            setEditingAthlete(null);
          }}>Athletes</button>
          <button onClick={() => {
            setActiveView('tests');
            setIsEditing(false);
            setEditingAthlete(null);
          }}>Tests</button>
          <button onClick={() => {
            setActiveView('scores');
            setIsEditing(false);
            setEditingAthlete(null);
          }}>Input Scores</button>
          <button onClick={() => {
            setActiveView('leaderboard');
            setIsEditing(false);
            setEditingAthlete(null);
          }}>Leaderboard</button>
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
              <button onClick={() => {
                setActiveView('athletes');
                setIsEditing(false);
                setEditingAthlete(null);
              }}>👥 Manage Athletes</button>
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
            
            {isEditing ? (
              <div className="edit-athlete-container">
                <div className="edit-header">
                  <h3>Edit Athlete</h3>
                  <button 
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    ← Back to List
                  </button>
                </div>
                
                <AthleteForm 
                  athlete={editingAthlete}
                  onSubmit={handleUpdateAthlete}
                  onCancel={handleCancelEdit}
                />
              </div>
            ) : (
              <>
                <div className="add-athlete-section">
                  <AthleteForm 
                    onSubmit={handleAddAthlete}
                  />
                </div>
                
                <div className="athlete-list-section">
                  <h3>All Athletes ({athletes.length})</h3>
                  <AthleteList 
                    athletes={athletes}
                    onDelete={handleDeleteAthlete}
                    onEdit={handleEditAthlete}
                    onAthletesUpdated={(updatedAthletes) => {
                      setAthletes(updatedAthletes);
                      refreshLeaderboard();
                    }}
                  />
                </div>
              </>
            )}
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
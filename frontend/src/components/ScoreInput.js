import React, { useState, useEffect } from 'react';
import { scoreAPI, athleteAPI, testAPI } from '../services/api';

function ScoreInput({ onScoreAdded }) {
  const [formData, setFormData] = useState({
    athleteId: '',
    testId: '',
    value: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  });
  
  const [athletes, setAthletes] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch athletes and tests on component mount
  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const [athletesRes, testsRes] = await Promise.all([
      athleteAPI.getAll(),
      testAPI.getAll()
    ]);
    
    // Filter out any null/undefined athletes
    const validAthletes = athletesRes.data.filter(athlete => athlete && athlete._id);
    setAthletes(validAthletes);
    setTests(testsRes.data);
    
    // Set default selections if available
    if (validAthletes.length > 0 && !formData.athleteId) {
      setFormData(prev => ({ 
        ...prev, 
        athleteId: validAthletes[0]._id 
      }));
    }
    
    if (testsRes.data.length > 0 && !formData.testId) {
      setFormData(prev => ({ 
        ...prev, 
        testId: testsRes.data[0]._id 
      }));
    }
    
  } catch (err) {
    setError('Failed to load athletes or tests');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// Also update the warning message check:
if (athletes.length === 0 || tests.length === 0) {
  return (
    <div className="warning-message">
      <h3>⚠️ Setup Required</h3>
      <p>Before recording scores, you need to:</p>
      <ul>
        {athletes.length === 0 && <li>Add at least one athlete</li>}
        {tests.length === 0 && <li>Create at least one test type</li>}
      </ul>
      <p>Please go to the appropriate sections to set up your data first.</p>
      <button 
        className="btn-primary"
        onClick={fetchData}
      >
        Refresh Data
      </button>
    </div>
  );
}

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const getSelectedTest = () => {
    return tests.find(test => test._id === formData.testId);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.athleteId || !formData.testId) {
    setError('Please select both athlete and test');
    return;
  }
  
  if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) <= 0) {
    setError('Please enter a valid positive number for the score');
    return;
  }
  
  const selectedTest = getSelectedTest();
  if (!selectedTest) {
    setError('Selected test not found');
    return;
  }

  setSubmitting(true);
  setError('');
  setSuccess('');

  try {
    const scoreData = {
      ...formData,
      value: parseFloat(formData.value)
    };
    
    const response = await scoreAPI.create(scoreData);
    
    // Show success message (different for update vs create)
    const athlete = athletes.find(a => a._id === formData.athleteId);
    const test = tests.find(t => t._id === formData.testId);
    
    const actionMessage = response.data.isUpdate 
      ? '🔄 Score updated' 
      : '✅ New score recorded';
    
    setSuccess(`${actionMessage}: ${athlete?.name} - ${test?.testName}: ${formData.value} ${test?.unit}`);
    
    // Reset form (keep athlete and test selections)
    setFormData(prev => ({
      ...prev,
      value: '',
      date: new Date().toISOString().split('T')[0]
    }));
    
    // Notify parent component
    if (onScoreAdded) {
      onScoreAdded(response.data.score);
    }
    
  } catch (err) {
    console.error('Score submission error:', err);
    
    let errorMsg = err.response?.data?.error || 'Failed to save score. Please try again.';
    
    // Handle specific error cases
    if (err.response?.status === 409) {
      errorMsg = 'A score already exists for this athlete, test, and date. It has been updated.';
    }
    
    setError(errorMsg);
  } finally {
    setSubmitting(false);
  }
};

  const handleAddAnother = () => {
    setFormData(prev => ({
      ...prev,
      value: ''
    }));
    setSuccess('');
  };

  if (loading) {
    return <div className="loading">Loading athletes and tests...</div>;
  }

  if (athletes.length === 0 || tests.length === 0) {
    return (
      <div className="warning-message">
        <h3>⚠️ Setup Required</h3>
        <p>Before recording scores, you need to:</p>
        <ul>
          {athletes.length === 0 && <li>Add at least one athlete</li>}
          {tests.length === 0 && <li>Create at least one test type</li>}
        </ul>
        <p>Please go to the appropriate sections to set up your data first.</p>
      </div>
    );
  }

  return (
    <div className="score-input">
      <h3>Record Test Score</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="athleteId">Athlete *</label>
            <select
              id="athleteId"
              name="athleteId"
              value={formData.athleteId}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select an athlete</option>
              {athletes.map(athlete => (
                <option key={athlete._id} value={athlete._id}>
                  {athlete.name} ({athlete.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="testId">Test Type *</label>
            <select
              id="testId"
              name="testId"
              value={formData.testId}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select a test</option>
              {tests.map(test => (
                <option key={test._id} value={test._id}>
                  {test.testName} ({test.unit}, {test.higherIsBetter ? 'higher better' : 'lower better'})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="value">
              Score Value * 
              {formData.testId && (
                <span className="unit-display">
                  (in {getSelectedTest()?.unit || 'units'})
                </span>
              )}
            </label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="Enter score"
              step="0.01"
              min="0"
              disabled={submitting}
              required
            />
            {formData.testId && (
              <div className="score-help">
                <small>
                  {getSelectedTest()?.higherIsBetter 
                    ? '⚠️ Higher values are better for this test' 
                    : '⚠️ Lower values are better for this test'}
                </small>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Test Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={submitting}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting || !formData.athleteId || !formData.testId || !formData.value}
          >
            {submitting ? 'Recording...' : 'Record Score'}
          </button>
          
          {success && (
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleAddAnother}
              disabled={submitting}
            >
              Add Another Score
            </button>
          )}
          
          <button 
            type="button" 
            className="btn-secondary"
            onClick={fetchData}
            disabled={submitting}
          >
            Refresh Lists
          </button>
        </div>
      </form>
      

    </div>
  );
}

// Helper component to show recent scores
function RecentScoresPreview({ athleteId, testId }) {
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (athleteId && testId) {
      fetchRecentScores();
    }
  }, [athleteId, testId]);

  const fetchRecentScores = async () => {
    setLoading(true);
    try {
      const response = await scoreAPI.getAll({
        athleteId,
        testId,
        limit: 5
      });
      setRecentScores(response.data);
    } catch (error) {
      console.error('Failed to fetch recent scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!athleteId || !testId) return null;

  return (
    <div className="recent-scores">
      <h4>Recent Scores for Selected Athlete & Test</h4>
      {loading ? (
        <p>Loading recent scores...</p>
      ) : recentScores.length === 0 ? (
        <p>No previous scores recorded for this combination.</p>
      ) : (
        <ul>
          {recentScores.map(score => (
            <li key={score._id}>
              <span className="score-value">{score.value}</span>
              <span className="score-date">
                on {new Date(score.date).toLocaleDateString()}
              </span>
              {score.createdAt && (
                <span className="score-time">
                  (recorded {new Date(score.createdAt).toLocaleDateString()})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScoreInput;
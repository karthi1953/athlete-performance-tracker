import React, { useState, useEffect } from 'react';
import { testAPI } from '../services/api';

function TestManager({ onTestsUpdated }) {
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({
    testName: '',
    unit: '',
    higherIsBetter: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await testAPI.getAll();
      setTests(response.data);
    } catch (err) {
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.testName.trim() || !formData.unit.trim()) {
      setError('Test name and unit are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await testAPI.create(formData);
      
      // Update tests list
      setTests(prev => [...prev, response.data]);
      
      // Clear form
      setFormData({
        testName: '',
        unit: '',
        higherIsBetter: false
      });
      
      setSuccess(`✅ Test "${response.data.testName}" created successfully!`);
      
      // Notify parent
      if (onTestsUpdated) {
        onTestsUpdated([...tests, response.data]);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete all scores recorded for this test.')) {
      return;
    }

    try {
      // We don't have a delete endpoint yet, so let's add one to our API service
      await api.delete(`/tests/${id}`);
      
      const updatedTests = tests.filter(test => test._id !== id);
      setTests(updatedTests);
      
      if (onTestsUpdated) {
        onTestsUpdated(updatedTests);
      }
      
      setSuccess('Test deleted successfully');
    } catch (err) {
      setError('Failed to delete test');
    }
  };

  // Common test presets for quick setup
  const commonTests = [
    { testName: "30m Sprint", unit: "seconds", higherIsBetter: false },
    { testName: "Vertical Jump", unit: "inches", higherIsBetter: true },
    { testName: "Bench Press", unit: "reps", higherIsBetter: true },
    { testName: "Beep Test", unit: "level", higherIsBetter: true },
    { testName: "Agility Shuttle", unit: "seconds", higherIsBetter: false }
  ];

  const addCommonTest = (test) => {
    setFormData(test);
  };

  return (
    <div className="test-manager">
      <div className="manager-header">
        <h3>Test Types Management</h3>
        <button 
          className="btn-secondary"
          onClick={fetchTests}
          disabled={loading}
        >
          Refresh Tests
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Quick Setup Section */}
      <div className="quick-setup">
        <h4>Quick Setup - Common Tests</h4>
        <p className="help-text">Click on a common test to pre-fill the form:</p>
        <div className="common-tests">
          {commonTests.map((test, index) => (
            <button
              key={index}
              className="common-test-btn"
              onClick={() => addCommonTest(test)}
              disabled={loading}
            >
              {test.testName}
              <small>{test.unit} ({test.higherIsBetter ? '↑ higher better' : '↓ lower better'})</small>
            </button>
          ))}
        </div>
      </div>

      {/* Add Test Form */}
      <div className="add-test-form">
        <h4>Add New Test Type</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="testName">Test Name *</label>
              <input
                type="text"
                id="testName"
                name="testName"
                value={formData.testName}
                onChange={handleChange}
                placeholder="e.g., 30m Sprint"
                disabled={loading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="unit">Measurement Unit *</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., seconds, inches, reps"
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="higherIsBetter"
                checked={formData.higherIsBetter}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkbox-custom"></span>
              Higher values are better (e.g., jumps, reps)
            </label>
            <small className="help-text">
              Check if higher numbers mean better performance (uncheck for tests like sprint where lower is better)
            </small>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !formData.testName.trim() || !formData.unit.trim()}
            >
              {loading ? 'Creating...' : 'Add Test Type'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Tests List */}
      <div className="tests-list">
        <h4>Existing Test Types ({tests.length})</h4>
        
        {loading ? (
          <p>Loading tests...</p>
        ) : tests.length === 0 ? (
          <div className="empty-state">
            <p>No test types created yet. Add your first test above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Unit</th>
                  <th>Scoring</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => (
                  <tr key={test._id}>
                    <td>
                      <strong>{test.testName}</strong>
                    </td>
                    <td>
                      <span className="unit-badge">{test.unit}</span>
                    </td>
                    <td>
                      <span className={`scoring-badge ${test.higherIsBetter ? 'higher-better' : 'lower-better'}`}>
                        {test.higherIsBetter ? '↑ Higher Better' : '↓ Lower Better'}
                      </span>
                    </td>
                    <td>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleDelete(test._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test Type Examples */}
      <div className="test-examples">
        <h4>💡 Test Type Examples</h4>
        <div className="examples-grid">
          <div className="example">
            <h5>Speed Tests</h5>
            <ul>
              <li><strong>30m Sprint</strong> - seconds, lower better</li>
              <li><strong>40yd Dash</strong> - seconds, lower better</li>
              <li><strong>Agility T-Test</strong> - seconds, lower better</li>
            </ul>
          </div>
          <div className="example">
            <h5>Power Tests</h5>
            <ul>
              <li><strong>Vertical Jump</strong> - inches, higher better</li>
              <li><strong>Broad Jump</strong> - feet, higher better</li>
              <li><strong>Medicine Ball Throw</strong> - meters, higher better</li>
            </ul>
          </div>
          <div className="example">
            <h5>Strength Tests</h5>
            <ul>
              <li><strong>Bench Press</strong> - reps/weight, higher better</li>
              <li><strong>Squat Max</strong> - lbs/kg, higher better</li>
              <li><strong>Pull-ups</strong> - reps, higher better</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// We need to add delete to our API service
const api = {
  delete: (url) => fetch(`http://localhost:5000${url}`, { method: 'DELETE' })
};

export default TestManager;
// frontend/src/components/AthleteForm.js
import React, { useState } from 'react';
import { athleteAPI } from '../services/api';

function AthleteForm({ onAthleteAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'viewer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await athleteAPI.create(formData);
      
      // Clear form
      setFormData({
        name: '',
        role: 'viewer'
      });
      
      // Notify parent
      if (onAthleteAdded) {
        onAthleteAdded(response.data);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create athlete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="athlete-form">
      <h3>{onCancel ? 'Edit Athlete' : 'Add New Athlete'}</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Athlete Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter athlete name"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="viewer">Viewer (Athlete)</option>
            <option value="coach">Coach</option>
          </select>
          <small className="help-text">
            Coaches can manage athletes and scores. Viewers can only see their own data.
          </small>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Saving...' : (onCancel ? 'Update' : 'Add Athlete')}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AthleteForm;
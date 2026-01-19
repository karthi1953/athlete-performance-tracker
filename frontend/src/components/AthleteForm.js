// frontend/src/components/AthleteForm.js
import React, { useState, useEffect } from 'react';

function AthleteForm({ athlete, onSubmit, onCancel }) {
  // Initialize with empty form
  const [formData, setFormData] = useState({
    name: '',
    role: 'viewer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when athlete prop changes
  useEffect(() => {
    if (athlete) {
      console.log('Setting form data for athlete:', athlete._id || athlete.id, athlete.name);
      setFormData({
        name: athlete.name || '',
        role: athlete.role || 'viewer'
      });
    } else {
      // Reset to empty for new athlete
      setFormData({
        name: '',
        role: 'viewer'
      });
    }
  }, [athlete]); // Reset when athlete prop changes

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
      // Pass formData to parent component
      if (onSubmit) {
        await onSubmit(formData);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save athlete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="athlete-form">
      
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
            {loading ? 'Saving...' : (athlete ? 'Update Athlete' : 'Add Athlete')}
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
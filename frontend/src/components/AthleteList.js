import React, { useState } from 'react';
import { athleteAPI } from '../services/api';
import AthleteForm from './AthleteForm';
function AthleteList({ athletes: initialAthletes, onAthletesUpdated }) {
  const [athletes, setAthletes] = useState(initialAthletes);
  const [showForm, setShowForm] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAthleteAdded = (newAthlete) => {
    setAthletes(prev => [...prev, newAthlete]);
    setShowForm(false);
    if (onAthletesUpdated) {
      onAthletesUpdated([...athletes, newAthlete]);
    }
  };

const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this athlete? All their scores will also be deleted.')) {
    return;
  }

  setLoading(true);
  try {
    const response = await athleteAPI.delete(id);
    
    const updatedAthletes = athletes.filter(athlete => athlete._id !== id);
    setAthletes(updatedAthletes);
    
    if (onAthletesUpdated) {
      onAthletesUpdated(updatedAthletes);
    }
    
    alert('Athlete deleted successfully!');
    
  } catch (error) {
    console.error('Delete error details:', error);
    
    // error handling
    let errorMessage = 'Failed to delete athlete';
    
    if (error.response) {
      errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check if the backend is running.';
    } else {
      errorMessage = error.message;
    }
    
    alert(`Error: ${errorMessage}`);
    
    // Re-fetch athletes to ensure UI is in sync
    try {
      const freshResponse = await athleteAPI.getAll();
      setAthletes(freshResponse.data);
      if (onAthletesUpdated) {
        onAthletesUpdated(freshResponse.data);
      }
    } catch (fetchError) {
      console.error('Failed to refresh athletes:', fetchError);
    }
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (athlete) => {
    setEditingAthlete(athlete);
  };

  const handleUpdate = async (updatedAthlete) => {
    try {
      const response = await athleteAPI.update(updatedAthlete._id, updatedAthlete);
      const updatedAthletes = athletes.map(a => 
        a._id === updatedAthlete._id ? response.data : a
      );
      setAthletes(updatedAthletes);
      setEditingAthlete(null);
      if (onAthletesUpdated) {
        onAthletesUpdated(updatedAthletes);
      }
    } catch (error) {
      alert('Failed to update athlete: ' + (error.response?.data?.error || error.message));
    }
  };

  if (editingAthlete) {
    return (
      <div className="edit-athlete-form">
        <h3>Edit Athlete</h3>
        <AthleteForm 
          initialData={editingAthlete}
          onAthleteAdded={handleUpdate}
          onCancel={() => setEditingAthlete(null)}
        />
      </div>
    );
  }

  return (
    <div className="athlete-list">
      <div className="list-header">
        <h3>Athletes ({athletes.length})</h3>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? 'Cancel' : '+ Add Athlete'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <AthleteForm onAthleteAdded={handleAthleteAdded} />
        </div>
      )}

      {athletes.length === 0 ? (
        <div className="empty-state">
          <p>No athletes yet. Add your first athlete to get started!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map(athlete => (
                <tr key={athlete._id}>
                  <td>{athlete.name}</td>
                  <td>
                    <span className={`role-badge ${athlete.role}`}>
                      {athlete.role}
                    </span>
                  </td>
                  <td>
                    {new Date(athlete.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      className="btn-small"
                      onClick={() => handleEdit(athlete)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(athlete._id)}
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
  );
}

export default AthleteList;
import React, { useState } from 'react';

const AthleteList = ({ athletes, onDelete, onEdit, onAthletesUpdated }) => {
  const [roleFilter, setRoleFilter] = useState('all');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter athletes based on role only (search removed)
  const filteredAthletes = athletes.filter(athlete => {
    const matchesRole = roleFilter === 'all' || athlete.role === roleFilter;
    return matchesRole;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      if (onDelete && typeof onDelete === 'function') {
        onDelete(id);
      } else {
        console.error('onDelete is not a function');
      }
    }
  };

  const handleEdit = (athlete) => {
    if (onEdit && typeof onEdit === 'function') {
      onEdit(athlete);
    } else {
      console.error('onEdit is not a function');
    }
  };

  return (
    <div className="athletes-view">
      <div className="list-header">

      </div>

      {filteredAthletes.length === 0 ? (
        <div className="empty-state">
          <p>No athletes found.</p>
        </div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="table-container">
            <table className="athlete-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Athlete ID</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((athlete) => (
                  <tr key={athlete._id || athlete.id}>
                    <td>
                      <div className="athlete-name">{athlete.name}</div>
                    </td>
                    <td>
                      <span className={`role-badge ${athlete.role}`}>
                        {athlete.role.charAt(0).toUpperCase() + athlete.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <code className="athlete-id">{(athlete._id || athlete.id || '').substring(0, 8)}...</code>
                    </td>
                    <td>
                      {formatDate(athlete.createdAt)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-small btn-edit" 
                          onClick={() => handleEdit(athlete)}
                          title="Edit athlete"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-small btn-danger" 
                          onClick={() => handleDelete(athlete._id || athlete.id)}
                          title="Delete athlete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="mobile-athletes-list">
            {filteredAthletes.map((athlete) => (
              <div key={athlete._id || athlete.id} className="athlete-card">
                <div className="athlete-card-info">
                  <div className="athlete-card-header">
                    <div className="athlete-card-name">{athlete.name}</div>
                    <span className={`athlete-card-role ${athlete.role}`}>
                      {athlete.role.charAt(0).toUpperCase() + athlete.role.slice(1)}
                    </span>
                  </div>
                  <div className="athlete-card-details">
                    <span className="athlete-card-id">
                      <strong>ID:</strong> {(athlete._id || athlete.id || '').substring(0, 12)}...
                    </span>
                    <span className="athlete-card-date">
                      <strong>Joined:</strong> {formatDate(athlete.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="athlete-card-actions">
                  <button 
                    className="btn-small btn-edit" 
                    onClick={() => handleEdit(athlete)}
                    title="Edit athlete"
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-small btn-danger" 
                    onClick={() => handleDelete(athlete._id || athlete.id)}
                    title="Delete athlete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AthleteList;
import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async (params = {}) => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (dateRange.startDate || dateRange.endDate) {
        // Use filtered endpoint if dates are selected
        response = await leaderboardAPI.getFiltered({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
      } else {
        // Use regular endpoint
        response = await leaderboardAPI.get();
      }
      
      setLeaderboard(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leaderboard');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyDateFilter = () => {
    fetchLeaderboard();
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: '',
      endDate: new Date().toISOString().split('T')[0]
    });
    fetchLeaderboard();
  };

  const getBadge = (rank, totalPoints) => {
    if (rank === 1) return { text: '🥇 Gold', class: 'gold' };
    if (rank === 2) return { text: '🥈 Silver', class: 'silver' };
    if (rank === 3) return { text: '🥉 Bronze', class: 'bronze' };
    if (totalPoints > 200) return { text: '🌟 Elite', class: 'elite' };
    if (totalPoints > 100) return { text: '⭐ Star', class: 'star' };
    return { text: '🏅 Athlete', class: 'athlete' };
  };

  const getPerformanceColor = (points) => {
    if (points >= 90) return 'excellent';
    if (points >= 70) return 'good';
    if (points >= 50) return 'average';
    return 'poor';
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>⚠️ Error Loading Leaderboard</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchLeaderboard}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Performance Leaderboard</h2>
        
        <div className="leaderboard-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
          >
            {viewMode === 'summary' ? 'Show Details' : 'Show Summary'}
          </button>
          
          <button 
            className="btn-primary"
            onClick={fetchLeaderboard}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Date Filter Section */}
      {showFilters && (
        <div className="filters-section">
          <h4>Filter by Date Range</h4>
          <div className="date-filters">
            <div className="form-group">
              <label htmlFor="startDate">From Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                max={dateRange.endDate}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">To Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="filter-actions">
              <button 
                className="btn-primary"
                onClick={applyDateFilter}
                disabled={loading}
              >
                Apply Filter
              </button>
              
              <button 
                className="btn-secondary"
                onClick={clearDateFilter}
                disabled={loading}
              >
                Clear Filter
              </button>
            </div>
          </div>
          
          {(dateRange.startDate || dateRange.endDate !== new Date().toISOString().split('T')[0]) && (
            <div className="active-filter">
              <small>
                Showing results from: 
                <strong> {dateRange.startDate || 'Beginning'} </strong>
                to <strong> {dateRange.endDate} </strong>
              </small>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="leaderboard-stats">
        <div className="stat-item">
          <span className="stat-label">Total Athletes Ranked:</span>
          <span className="stat-value">{leaderboard.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Top Score:</span>
          <span className="stat-value">
            {leaderboard.length > 0 ? leaderboard[0].totalPoints.toFixed(1) : '0'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Score:</span>
          <span className="stat-value">
            {leaderboard.length > 0 
              ? (leaderboard.reduce((sum, athlete) => sum + athlete.totalPoints, 0) / leaderboard.length).toFixed(1)
              : '0'
            }
          </span>
        </div>
      </div>

      {/* Leaderboard Content */}
      {leaderboard.length === 0 ? (
        <div className="empty-leaderboard">
          <h3>No Scores Recorded Yet</h3>
          <p>Start by adding test scores to see athletes ranked on the leaderboard.</p>
          <button 
            className="btn-primary"
            onClick={fetchLeaderboard}
          >
            Check Again
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-container desktop-only">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Athlete</th>
                  <th>Total Points</th>
                  <th>Badge</th>
                  {viewMode === 'detailed' && <th>Test Details</th>}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((athlete) => {
                  const badge = getBadge(athlete.rank, athlete.totalPoints);
                  
                  return (
                    <tr key={athlete.athleteId || athlete._id} className={`rank-${athlete.rank}`}>
                      <td className="rank-cell">
                        <div className="rank-number">{athlete.rank}</div>
                      </td>
                      
                      <td className="athlete-cell">
                        <div className="athlete-name">{athlete.name}</div>
                        {viewMode === 'detailed' && athlete.testDetails && (
                          <div className="athlete-id">
                            ID: {athlete.athleteId?.substring(0, 8)}...
                          </div>
                        )}
                      </td>
                      
                      <td className="points-cell">
                        <div className="points-total">
                          {athlete.totalPoints.toFixed(1)}
                        </div>
                        <div className="points-bar">
                          <div 
                            className="points-fill"
                            style={{ width: `${Math.min(100, (athlete.totalPoints / 300) * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      
                      <td className="badge-cell">
                        <span className={`badge ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                      
                      {viewMode === 'detailed' && athlete.testDetails && (
                        <td className="details-cell">
                          <div className="test-details">
                            {athlete.testDetails.map((test, index) => (
                              <div key={index} className="test-detail">
                                <span className="test-name">{test.testName}:</span>
                                <span className="test-score">{test.rawValue} {test.unit}</span>
                                <span className={`test-points ${getPerformanceColor(test.points)}`}>
                                  ({test.points.toFixed(1)} pts)
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-leaderboard mobile-only">
            {leaderboard.map((athlete) => {
              const rankClass = athlete.rank === 1 ? 'gold' : 
                              athlete.rank === 2 ? 'silver' : 
                              athlete.rank === 3 ? 'bronze' : 'other';
              
              const badgeEmoji = athlete.rank === 1 ? '🥇' : 
                                athlete.rank === 2 ? '🥈' : 
                                athlete.rank === 3 ? '🥉' : '🏅';
              
              return (
                <div key={athlete.athleteId || athlete._id} className="leaderboard-card">
                  {/* Rank Column */}
                  <div className="card-rank">
                    <div className={`rank-circle ${rankClass}`}>
                      {athlete.rank}
                    </div>
                    <span className="card-badge">
                      {badgeEmoji}
                    </span>
                  </div>
                  
                  {/* Athlete Info Column */}
                  <div className="card-athlete">
                    <span className="card-name">{athlete.name}</span>
                    {viewMode === 'detailed' && athlete.testDetails && (
                      <small className="card-tests">
                        {athlete.testDetails.length} tests
                      </small>
                    )}
                  </div>
                  
                  {/* Points Column */}
                  <div className="card-points">
                    <div className="card-score">{athlete.totalPoints.toFixed(1)}</div>
                    <small className="card-label">points</small>
                  </div>
                  
                  {/* Test Details - Show when in detailed view mode */}
                  {viewMode === 'detailed' && athlete.testDetails && (
                    <div className="card-details">
                      <div className="card-details-header">
                        <small>Test Breakdown:</small>
                      </div>
                      <div className="card-tests-list">
                        {athlete.testDetails.map((test, index) => (
                          <div key={index} className="card-test-item">
                            <div className="card-test-name">{test.testName}</div>
                            <div className="card-test-value">
                              {test.rawValue} {test.unit}
                            </div>
                            <div className={`card-test-points ${getPerformanceColor(test.points)}`}>
                              {test.points.toFixed(1)} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="leaderboard-legend">
            <h4>📊 Scoring Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color excellent"></span>
                <span>Excellent (90+ pts per test)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color good"></span>
                <span>Good (70-89 pts)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color average"></span>
                <span>Average (50-69 pts)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color poor"></span>
                <span>Needs Improvement (&lt;50 pts)</span>
              </div>
            </div>
            <p className="legend-note">
              <small>
                Each test is normalized to 0-100 points. Total score = sum of all test points.
              </small>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Leaderboard;
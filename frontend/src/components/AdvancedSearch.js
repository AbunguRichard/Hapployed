import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdvancedSearch.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const AdvancedSearch = ({ type = 'gigs', onResults }) => {
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    skills: [],
    location: null,
    budgetMin: '',
    budgetMax: '',
    experienceLevel: '',
    sortBy: 'relevance'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAvailableFilters();
  }, [type]);

  const loadAvailableFilters = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/search/filters?type=${type}`);
      setAvailableFilters(response.data.data);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/search/suggestions?q=${query}&type=${type}`);
        setSuggestions(response.data.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300),
    [type]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setFilters(prev => ({ ...prev, query }));
    debouncedSearch(query);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSearch = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        ...filters,
        page,
        skills: filters.skills.join(','),
        location: filters.location ? JSON.stringify(filters.location) : undefined
      };

      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(`${BACKEND_URL}/api/search/${type}`, { params });
      if (onResults) {
        onResults(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skill) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
        query: '' // Clear main query when adding skill
      }));
      setSuggestions([]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className="advanced-search">
      {/* Main Search Bar */}
      <div className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            placeholder={`Search for ${type}...`}
            value={filters.query}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button 
            className="search-btn"
            onClick={() => handleSearch()}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => addSkill(suggestion.text)}
              >
                <span className="suggestion-text">{suggestion.text}</span>
                <span className="suggestion-category">{suggestion.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applied Filters */}
      <div className="applied-filters">
        {filters.skills.map(skill => (
          <span key={skill} className="filter-tag">
            {skill}
            <button onClick={() => removeSkill(skill)}>×</button>
          </span>
        ))}
        {filters.category && (
          <span className="filter-tag">
            Category: {filters.category}
            <button onClick={() => handleFilterChange('category', '')}>×</button>
          </span>
        )}
        {filters.location && (
          <span className="filter-tag">
            Location: {filters.location.name}
            <button onClick={() => handleFilterChange('location', null)}>×</button>
          </span>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="filter-toggle">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline"
        >
          {showFilters ? '▲' : '▼'} Advanced Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {availableFilters.categories?.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Skills</label>
            <div className="skills-input">
              <input
                type="text"
                placeholder="Add skills..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addSkill(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          {type === 'gigs' && (
            <>
              <div className="filter-group">
                <label>Budget Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.budgetMin}
                    onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.budgetMax}
                    onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                >
                  <option value="">Any Level</option>
                  {availableFilters.experience_levels?.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === 'talents' && (
            <>
              <div className="filter-group">
                <label>Hourly Rate</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.hourlyRateMin}
                    onChange={(e) => handleFilterChange('hourlyRateMin', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.hourlyRateMax}
                    onChange={(e) => handleFilterChange('hourlyRateMax', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Verification Level</label>
                <select
                  value={filters.verificationLevel}
                  onChange={(e) => handleFilterChange('verificationLevel', e.target.value)}
                >
                  <option value="">Any Level</option>
                  {availableFilters.verification_levels?.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="filter-group">
            <label>Location</label>
            <select
              value={filters.location?.name || ''}
              onChange={(e) => {
                const selectedLocation = availableFilters.locations?.find(
                  loc => loc.name === e.target.value
                );
                handleFilterChange('location', selectedLocation || null);
              }}
            >
              <option value="">Any Location</option>
              {availableFilters.locations?.map(location => (
                <option key={location.name} value={location.name}>
                  {location.name} ({location.count})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              {type === 'gigs' && (
                <>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                  <option value="urgency">Urgency</option>
                </>
              )}
              {type === 'talents' && (
                <>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="rate_low">Rate: Low to High</option>
                  <option value="rate_high">Rate: High to Low</option>
                </>
              )}
            </select>
          </div>

          <div className="filter-actions">
            <button 
              className="btn-primary"
              onClick={() => handleSearch()}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Apply Filters'}
            </button>
            <button 
              className="btn-outline"
              onClick={() => {
                setFilters({
                  query: '',
                  category: '',
                  skills: [],
                  location: null,
                  budgetMin: '',
                  budgetMax: '',
                  experienceLevel: '',
                  sortBy: 'relevance'
                });
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

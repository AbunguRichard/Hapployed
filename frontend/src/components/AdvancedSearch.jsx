import React, { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function AdvancedSearch({ type, onResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Gig filters
  const [gigFilters, setGigFilters] = useState({
    category: '',
    budget_min: '',
    budget_max: '',
    experience_level: '',
    location: '',
    sort: 'relevance'
  });

  // Talent filters
  const [talentFilters, setTalentFilters] = useState({
    location: '',
    experience_min: '',
    experience_max: '',
    hourly_rate_min: '',
    hourly_rate_max: '',
    availability: '',
    verification_level: '',
    rating_min: '',
    sort: 'rating'
  });

  const [availableFilters, setAvailableFilters] = useState({
    gigs: { categories: [], skills: [], experience_levels: [], locations: [] },
    talents: { skills: [], locations: [], verification_levels: [] }
  });

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, type]);

  const fetchAvailableFilters = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search/filters`);
      if (response.ok) {
        const data = await response.json();
        setAvailableFilters(data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search/suggestions?query=${encodeURIComponent(searchQuery)}&type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/search/${type}?`;
      const params = new URLSearchParams();

      if (searchQuery) params.append('query', searchQuery);
      if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));

      if (type === 'gigs') {
        Object.entries(gigFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      } else {
        Object.entries(talentFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await fetch(url + params.toString());
      if (response.ok) {
        const data = await response.json();
        onResults(data);
      } else {
        console.error('Search failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setGigFilters({
      category: '',
      budget_min: '',
      budget_max: '',
      experience_level: '',
      location: '',
      sort: 'relevance'
    });
    setTalentFilters({
      location: '',
      experience_min: '',
      experience_max: '',
      hourly_rate_min: '',
      hourly_rate_max: '',
      availability: '',
      verification_level: '',
      rating_min: '',
      sort: 'rating'
    });
    onResults(null);
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      {/* Search Input with Autocomplete */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={`Search ${type}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            outline: 'none'
          }}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => addSkill(suggestion)}
                style={{
                  padding: '12px 15px',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>Selected Skills:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: '#007bff',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{
            background: showAdvancedFilters ? '#007bff' : 'white',
            color: showAdvancedFilters ? 'white' : '#007bff',
            border: '2px solid #007bff',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Advanced Filters</h3>
          
          {type === 'gigs' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
                <select
                  value={gigFilters.category}
                  onChange={(e) => setGigFilters({...gigFilters, category: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">All Categories</option>
                  {availableFilters.gigs.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Budget Range</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={gigFilters.budget_min}
                    onChange={(e) => setGigFilters({...gigFilters, budget_min: e.target.value})}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={gigFilters.budget_max}
                    onChange={(e) => setGigFilters({...gigFilters, budget_max: e.target.value})}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Experience Level</label>
                <select
                  value={gigFilters.experience_level}
                  onChange={(e) => setGigFilters({...gigFilters, experience_level: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Any Level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={gigFilters.location}
                  onChange={(e) => setGigFilters({...gigFilters, location: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sort By</label>
                <select
                  value={gigFilters.sort}
                  onChange={(e) => setGigFilters({...gigFilters, sort: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={talentFilters.location}
                  onChange={(e) => setTalentFilters({...talentFilters, location: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hourly Rate</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={talentFilters.hourly_rate_min}
                    onChange={(e) => setTalentFilters({...talentFilters, hourly_rate_min: e.target.value})}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={talentFilters.hourly_rate_max}
                    onChange={(e) => setTalentFilters({...talentFilters, hourly_rate_max: e.target.value})}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Verification Level</label>
                <select
                  value={talentFilters.verification_level}
                  onChange={(e) => setTalentFilters({...talentFilters, verification_level: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Any Level</option>
                  <option value="basic">Basic</option>
                  <option value="verified">Verified</option>
                  <option value="premium">Premium</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Availability</label>
                <select
                  value={talentFilters.availability}
                  onChange={(e) => setTalentFilters({...talentFilters, availability: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Any Availability</option>
                  <option value="available">Available Now</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sort By</label>
                <select
                  value={talentFilters.sort}
                  onChange={(e) => setTalentFilters({...talentFilters, sort: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="rate_high">Rate: High to Low</option>
                  <option value="rate_low">Rate: Low to High</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            minWidth: '120px'
          }}
        >
          {loading ? 'Searching...' : 'Apply Filters'}
        </button>
        
        <button
          onClick={clearAllFilters}
          style={{
            background: 'white',
            color: '#dc3545',
            border: '2px solid #dc3545',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
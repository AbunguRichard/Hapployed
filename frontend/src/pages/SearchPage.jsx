import React, { useState } from 'react';
import AdvancedSearch from '../components/AdvancedSearch';

export default function SearchPage() {
  const [results, setResults] = useState(null);
  const [searchType, setSearchType] = useState('gigs');

  const handleResults = (data) => {
    setResults(data);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍 Advanced Search</h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Find the perfect {searchType === 'gigs' ? 'gigs' : 'talents'} with powerful filters
        </p>
      </div>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setSearchType('gigs')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            background: searchType === 'gigs' ? '#007bff' : 'white',
            color: searchType === 'gigs' ? 'white' : '#007bff',
            border: '2px solid #007bff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Search Gigs
        </button>
        <button
          onClick={() => setSearchType('talents')}
          style={{
            padding: '10px 20px',
            background: searchType === 'talents' ? '#007bff' : 'white',
            color: searchType === 'talents' ? 'white' : '#007bff',
            border: '2px solid #007bff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Search Talents
        </button>
      </div>

      <AdvancedSearch type={searchType} onResults={handleResults} />

      {results && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Search Results ({results.pagination?.total || 0})</h2>
          
          {searchType === 'gigs' && results.gigs && results.gigs.length > 0 ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {results.gigs.map((gig) => (
                <div
                  key={gig.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ marginBottom: '10px' }}>{gig.title}</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>{gig.description}</p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666' }}>
                    <span>💰 ${gig.budget || 'N/A'}</span>
                    <span>📁 {gig.category || 'General'}</span>
                    <span>📍 {gig.location || 'Remote'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : searchType === 'talents' && results.talents && results.talents.length > 0 ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {results.talents.map((talent) => (
                <div
                  key={talent.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ marginBottom: '10px' }}>{talent.username}</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>
                    {talent.profile?.bio || 'No bio available'}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666' }}>
                    <span>⭐ {talent.profile?.rating || 0}/5</span>
                    <span>💵 ${talent.profile?.hourlyRate || 0}/hr</span>
                    <span>✅ {talent.profile?.verificationLevel || 'Basic'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No results found. Try adjusting your filters.
            </div>
          )}

          {results.pagination && results.pagination.pages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <span style={{ color: '#666' }}>
                Page {results.pagination.current} of {results.pagination.pages}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

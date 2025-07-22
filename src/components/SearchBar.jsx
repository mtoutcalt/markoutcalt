import { useState, useEffect, useMemo } from 'react';

export default function SearchBar({ searchData = [], placeholder = "Search posts, quotes, and advice..." }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return searchData
      .filter(item => 
        item.title?.toLowerCase().includes(lowercaseQuery) ||
        item.description?.toLowerCase().includes(lowercaseQuery) ||
        item.content?.toLowerCase().includes(lowercaseQuery) ||
        item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
      .slice(0, 8); // Limit to 8 results for better UX
  }, [query, searchData]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight">{part}</mark> : 
        part
    );
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <svg 
          className="search-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="search-input"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="search-clear"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="search-results">
          {filteredResults.length > 0 ? (
            <>
              {filteredResults.map((result, index) => (
                <a 
                  key={index}
                  href={result.url}
                  className="search-result-item"
                  onClick={handleResultClick}
                >
                  <div className="search-result-header">
                    <h4>{highlightText(result.title, query)}</h4>
                    <span className="search-result-type">{result.type}</span>
                  </div>
                  {result.description && (
                    <p className="search-result-description">
                      {highlightText(result.description, query)}
                    </p>
                  )}
                  <div className="search-result-meta">
                    {result.pubDate && (
                      <span className="search-result-date">{formatDate(result.pubDate)}</span>
                    )}
                    {result.tags && result.tags.length > 0 && (
                      <div className="search-result-tags">
                        {result.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="search-result-tag">
                            {highlightText(tag, query)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </>
          ) : (
            <div className="search-no-results">
              <p>No results found for "{query}"</p>
              <p className="search-suggestions">Try searching for "quotes", "advice", or "programming"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
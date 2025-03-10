import { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { searchCoins } from '@/lib/api';

export default function CoinSearch({ onSelectCoin }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((value) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only search if query is at least 3 characters
    if (value.trim().length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await searchCoins(value);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching coins:', error);
        // Show a user-friendly message for rate limiting
        if (error.response && error.response.status === 429) {
          console.log('Rate limit exceeded. Please try again in a moment.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms delay
  }, []);

  // Handle search input change
  const handleSearch = (value) => {
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle selecting a coin from search results
  const handleSelectCoin = (coin) => {
    if (onSelectCoin) {
      onSelectCoin(coin);
    }
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for cryptocurrencies (min 3 characters)..."
          className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          ) : (
            <FaSearch className="text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <ul>
            {results.map((coin) => (
              <li key={coin.id}>
                <button
                  onClick={() => handleSelectCoin(coin)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  {coin.thumb && (
                    <img
                      src={coin.thumb}
                      alt={`${coin.name} logo`}
                      className="w-6 h-6 mr-2 rounded-full"
                    />
                  )}
                  <div>
                    <span className="font-medium">{coin.name}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {coin.symbol}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.trim().length >= 3 && results.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
          No cryptocurrencies found matching "{query}"
        </div>
      )}
    </div>
  );
}
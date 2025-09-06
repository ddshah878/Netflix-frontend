import { useState, useEffect, useCallback } from 'react';

const API_KEY = "f55f6900f6e557bedc9d4d2fe4e005b8";
const BASE_URL = "https://api.themoviedb.org/3";

// Custom hook for API calls - this encapsulates all API-related logic
export const useMovieAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call function
  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Specific API methods
  const getPopularMovies = useCallback(async (page = 1) => {
    const data = await apiCall(`/movie/popular?api_key=${API_KEY}&page=${page}`);
    return data.results;
  }, [apiCall]);

  const getTrendingMovies = useCallback(async (timeWindow = 'week', page = 1) => {
    const data = await apiCall(`/trending/movie/${timeWindow}?api_key=${API_KEY}&page=${page}`);
    return data.results;
  }, [apiCall]);

  const getTopRatedMovies = useCallback(async (page = 1) => {
    const data = await apiCall(`/movie/top_rated?api_key=${API_KEY}&page=${page}`);
    return data.results;
  }, [apiCall]);

  const getUpcomingMovies = useCallback(async (page = 1) => {
    const data = await apiCall(`/movie/upcoming?api_key=${API_KEY}&page=${page}`);
    return data.results;
  }, [apiCall]);

  const searchMovies = useCallback(async (query, page = 1) => {
    if (!query.trim()) return [];
    const data = await apiCall(`/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    return data.results;
  }, [apiCall]);

  const getMovieDetails = useCallback(async (movieId) => {
    const data = await apiCall(`/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits,reviews,similar`);
    return data;
  }, [apiCall]);

  const getMoviesByGenre = useCallback(async (genreId, page = 1) => {
    const data = await apiCall(`/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
    return data.results;
  }, [apiCall]);

  const getGenres = useCallback(async () => {
    const data = await apiCall(`/genre/movie/list?api_key=${API_KEY}`);
    return data.genres;
  }, [apiCall]);

  const discoverMovies = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({
      api_key: API_KEY,
      page: page.toString(),
      ...filters
    });
    
    const data = await apiCall(`/discover/movie?${params}`);
    return data.results;
  }, [apiCall]);

  return {
    loading,
    error,
    getPopularMovies,
    getTrendingMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies,
    getMovieDetails,
    getMoviesByGenre,
    getGenres,
    discoverMovies,
    clearError: () => setError(null)
  };
};

// Custom hook for managing movie collections (popular, trending, etc.)
export const useMovieCollection = (fetchFunction, dependencies = []) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMovies = useCallback(async (resetPage = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = resetPage ? 1 : page;
      const newMovies = await fetchFunction(currentPage);
      
      if (resetPage) {
        setMovies(newMovies);
        setPage(2);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(prev => prev + 1);
      }
      
      // TMDB typically returns 20 movies per page, if we get less, we've reached the end
      setHasMore(newMovies.length === 20);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, loading]);

  // Load initial movies
  useEffect(() => {
    loadMovies(true);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMovies();
    }
  }, [loadMovies, hasMore, loading]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadMovies(true);
  }, [loadMovies]);

  return {
    movies,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    clearError: () => setError(null)
  };
};

// Custom hook for debounced search
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for search functionality with debouncing
export const useMovieSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebounce(query, 300); // Wait 300ms after user stops typing
  const { searchMovies } = useMovieAPI();

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchMovies(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchMovies]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearError: () => setError(null),
    clearResults: () => {
      setQuery('');
      setResults([]);
    }
  };
};

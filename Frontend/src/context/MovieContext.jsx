import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  favorites: [],
  watchlist: [],
  searchHistory: [],
  user: {
    name: 'Movie Lover',
    preferences: {
      theme: 'dark',
      language: 'en'
    }
  }
};

// Action types - this pattern helps prevent typos and makes code more maintainable
export const ACTIONS = {
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  ADD_TO_WATCHLIST: 'ADD_TO_WATCHLIST',
  REMOVE_FROM_WATCHLIST: 'REMOVE_FROM_WATCHLIST',
  ADD_TO_SEARCH_HISTORY: 'ADD_TO_SEARCH_HISTORY',
  CLEAR_SEARCH_HISTORY: 'CLEAR_SEARCH_HISTORY',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
};

// Reducer function - this is where all state changes happen
// Using a reducer instead of multiple useState calls makes state management more predictable
function movieReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_TO_FAVORITES:
      // Check if movie is already in favorites to prevent duplicates
      if (state.favorites.some(movie => movie.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };

    case ACTIONS.REMOVE_FROM_FAVORITES:
      return {
        ...state,
        favorites: state.favorites.filter(movie => movie.id !== action.payload.id)
      };

    case ACTIONS.ADD_TO_WATCHLIST:
      if (state.watchlist.some(movie => movie.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload]
      };

    case ACTIONS.REMOVE_FROM_WATCHLIST:
      return {
        ...state,
        watchlist: state.watchlist.filter(movie => movie.id !== action.payload.id)
      };

    case ACTIONS.ADD_TO_SEARCH_HISTORY:
      // Keep only the last 10 searches
      const updatedHistory = [action.payload, ...state.searchHistory.filter(term => term !== action.payload)].slice(0, 10);
      return {
        ...state,
        searchHistory: updatedHistory
      };

    case ACTIONS.CLEAR_SEARCH_HISTORY:
      return {
        ...state,
        searchHistory: []
      };

    case ACTIONS.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload
          }
        }
      };

    case ACTIONS.LOAD_FROM_STORAGE:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

// Create Context
const MovieContext = createContext();

// Custom hook to use the context - this pattern makes it easier to use context
export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
};

// Provider component
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const savedFavorites = localStorage.getItem('movieApp_favorites');
        const savedWatchlist = localStorage.getItem('movieApp_watchlist');
        const savedSearchHistory = localStorage.getItem('movieApp_searchHistory');
        const savedPreferences = localStorage.getItem('movieApp_userPreferences');

        const storageData = {};
        
        if (savedFavorites) {
          storageData.favorites = JSON.parse(savedFavorites);
        }
        if (savedWatchlist) {
          storageData.watchlist = JSON.parse(savedWatchlist);
        }
        if (savedSearchHistory) {
          storageData.searchHistory = JSON.parse(savedSearchHistory);
        }
        if (savedPreferences) {
          storageData.user = {
            ...initialState.user,
            preferences: { ...initialState.user.preferences, ...JSON.parse(savedPreferences) }
          };
        }

        if (Object.keys(storageData).length > 0) {
          dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: storageData });
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadFromStorage();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('movieApp_favorites', JSON.stringify(state.favorites));
      localStorage.setItem('movieApp_watchlist', JSON.stringify(state.watchlist));
      localStorage.setItem('movieApp_searchHistory', JSON.stringify(state.searchHistory));
      localStorage.setItem('movieApp_userPreferences', JSON.stringify(state.user.preferences));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [state.favorites, state.watchlist, state.searchHistory, state.user.preferences]);

  // Action creators - these make it easier to dispatch actions
  const addToFavorites = (movie) => {
    dispatch({ type: ACTIONS.ADD_TO_FAVORITES, payload: movie });
  };

  const removeFromFavorites = (movie) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_FAVORITES, payload: movie });
  };

  const addToWatchlist = (movie) => {
    dispatch({ type: ACTIONS.ADD_TO_WATCHLIST, payload: movie });
  };

  const removeFromWatchlist = (movie) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_WATCHLIST, payload: movie });
  };

  const addToSearchHistory = (searchTerm) => {
    if (searchTerm.trim()) {
      dispatch({ type: ACTIONS.ADD_TO_SEARCH_HISTORY, payload: searchTerm.trim() });
    }
  };

  const clearSearchHistory = () => {
    dispatch({ type: ACTIONS.CLEAR_SEARCH_HISTORY });
  };

  const updateUserPreferences = (preferences) => {
    dispatch({ type: ACTIONS.UPDATE_USER_PREFERENCES, payload: preferences });
  };

  // Helper functions
  const isFavorite = (movieId) => {
    return state.favorites.some(movie => movie.id === movieId);
  };

  const isInWatchlist = (movieId) => {
    return state.watchlist.some(movie => movie.id === movieId);
  };

  // Context value
  const value = {
    // State
    ...state,
    // Actions
    addToFavorites,
    removeFromFavorites,
    addToWatchlist,
    removeFromWatchlist,
    addToSearchHistory,
    clearSearchHistory,
    updateUserPreferences,
    // Helper functions
    isFavorite,
    isInWatchlist
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

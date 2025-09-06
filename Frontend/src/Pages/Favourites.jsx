import '../CSS/Favorites.css';
import { useMovieContext } from '../context/MovieContext';
import MovieCard from '../Components/MovieCard';
import { useState } from 'react';

function Favourites() {
  const { favorites, watchlist, clearSearchHistory, searchHistory } = useMovieContext();
  const [activeTab, setActiveTab] = useState('favorites');

  const displayMovies = activeTab === 'favorites' ? favorites : watchlist;
  const title = activeTab === 'favorites' ? 'Favorite Movies' : 'Watchlist';
  const emptyMessage = activeTab === 'favorites' 
    ? 'No favorite movies yet. Start adding movies you love!' 
    : 'Your watchlist is empty. Add movies you want to watch later!';

  return (
    <div className="favourites">
      <div className="favourites-header">
        <h1>My Collection</h1>
        
        {/* Tab Navigation */}
        <div className="collection-tabs">
          <button 
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ Favorites ({favorites.length})
          </button>
          <button 
            className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            📝 Watchlist ({watchlist.length})
          </button>
        </div>
      </div>

      {/* Collection Stats */}
      <div className="collection-stats">
        <div className="stat-card">
          <div className="stat-number">{favorites.length}</div>
          <div className="stat-label">Favorites</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{watchlist.length}</div>
          <div className="stat-label">Watchlist</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{searchHistory.length}</div>
          <div className="stat-label">Recent Searches</div>
        </div>
      </div>

      {/* Movies Display */}
      {displayMovies.length > 0 ? (
        <div className="favourites-content">
          <div className="section-header">
            <h2>{title}</h2>
            <div className="sort-options">
              <select className="sort-select">
                <option value="recent">Recently Added</option>
                <option value="title">Title A-Z</option>
                <option value="year">Release Year</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          
          <div className="movies-grid">
            {displayMovies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
        </div>
      ) : (
        <div className="favourites-empty">
          <div className="empty-icon">
            {activeTab === 'favorites' ? '💔' : '📋'}
          </div>
          <h2>{emptyMessage}</h2>
          <p>Discover amazing movies on the home page and build your collection!</p>
          <a href="/" className="browse-button">
            🎬 Browse Movies
          </a>
        </div>
      )}

      {/* Search History Section */}
      {searchHistory.length > 0 && (
        <div className="search-history-section">
          <div className="section-header">
            <h3>Recent Searches</h3>
            <button 
              className="clear-history-btn"
              onClick={clearSearchHistory}
            >
              Clear History
            </button>
          </div>
          <div className="search-history-tags">
            {searchHistory.map((term, index) => (
              <span key={index} className="history-tag">
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Favourites;
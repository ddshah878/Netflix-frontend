import '../CSS/MovieCard.css';
import { useMovieContext } from '../context/MovieContext';
import { useState } from 'react';

const MovieCard = ({ movie }) => {
  const { 
    addToFavorites, 
    removeFromFavorites, 
    addToWatchlist, 
    removeFromWatchlist,
    isFavorite, 
    isInWatchlist 
  } = useMovieContext();
  
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const favoriteStatus = isFavorite(movie.id);
  const watchlistStatus = isInWatchlist(movie.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (favoriteStatus) {
      removeFromFavorites(movie);
    } else {
      addToFavorites(movie);
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (watchlistStatus) {
      removeFromWatchlist(movie);
    } else {
      addToWatchlist(movie);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const getRating = () => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  };

  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="movie-poster">
        {!imageError ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={`${movie.title} Poster`}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="placeholder-image">
            <div className="placeholder-content">
              <span className="movie-icon">🎬</span>
              <p>No Image Available</p>
            </div>
          </div>
        )}
        
        {/* Movie Overlay with Actions */}
        <div className={`movie-overlay ${showActions ? 'visible' : ''}`}>
          <div className="movie-actions">
            <button 
              className={`action-btn favorite-btn ${favoriteStatus ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              title={favoriteStatus ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favoriteStatus ? '❤️' : '🤍'}
            </button>
            
            <button 
              className={`action-btn watchlist-btn ${watchlistStatus ? 'active' : ''}`}
              onClick={handleWatchlistClick}
              title={watchlistStatus ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {watchlistStatus ? '📋' : '📝'}
            </button>
            
            <button 
              className="action-btn info-btn"
              title="More info"
            >
              ℹ️
            </button>
          </div>
          
          {/* Quick Info */}
          <div className="quick-info">
            <div className="rating">
              <span className="star">⭐</span>
              <span>{getRating()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title" title={movie.title}>
          {movie.title}
        </h3>
        <div className="movie-meta">
          <span className="release-year">{formatDate(movie.release_date)}</span>
          <span className="separator">•</span>
          <span className="rating">⭐ {getRating()}</span>
        </div>
        
        {movie.overview && (
          <p className="movie-overview">
            {movie.overview.length > 100 
              ? `${movie.overview.substring(0, 100)}...` 
              : movie.overview
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

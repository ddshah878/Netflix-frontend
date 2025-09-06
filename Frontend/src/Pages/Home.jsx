import React, { useState, useEffect, useMemo } from "react";
import MovieCard from "../Components/MovieCard";
import '../CSS/Home.css';
import { useMovieAPI, useMovieCollection, useMovieSearch } from "../hooks/useMovieAPI";
import { useMovieContext } from "../context/MovieContext";

function Home() {
    const [activeTab, setActiveTab] = useState('popular');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sortBy, setSortBy] = useState('popularity.desc');
    const [yearFilter, setYearFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { addToSearchHistory, searchHistory } = useMovieContext();
    const { getGenres, getPopularMovies, getTrendingMovies, getTopRatedMovies, discoverMovies } = useMovieAPI();
    const { query, setQuery, results: searchResults, loading: searchLoading } = useMovieSearch();

    // State for genres
    const [genres, setGenres] = useState([]);

    // Load genres on component mount
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genreList = await getGenres();
                setGenres(genreList);
            } catch (error) {
                console.error('Failed to load genres:', error);
            }
        };
        loadGenres();
    }, [getGenres]);

    // Movie collections based on active tab
    const fetchFunction = useMemo(() => {
        switch (activeTab) {
            case 'trending':
                return getTrendingMovies;
            case 'top_rated':
                return getTopRatedMovies;
            case 'popular':
            default:
                return getPopularMovies;
        }
    }, [activeTab, getTrendingMovies, getTopRatedMovies, getPopularMovies]);

    const { 
        movies: tabMovies, 
        loading: tabLoading, 
        error: tabError, 
        loadMore, 
        hasMore 
    } = useMovieCollection(fetchFunction, [activeTab]);

    // Filtered movies for discovery
    const [discoveredMovies, setDiscoveredMovies] = useState([]);
    const [discoveryLoading, setDiscoveryLoading] = useState(false);

    // Apply filters when they change
    useEffect(() => {
        const applyFilters = async () => {
            if (!selectedGenre && !yearFilter && !ratingFilter && sortBy === 'popularity.desc') {
                setDiscoveredMovies([]);
                return;
            }

            setDiscoveryLoading(true);
            try {
                const filters = {};
                if (selectedGenre) filters.with_genres = selectedGenre;
                if (yearFilter) filters.year = yearFilter;
                if (ratingFilter) filters['vote_average.gte'] = ratingFilter;
                filters.sort_by = sortBy;

                const results = await discoverMovies(filters);
                setDiscoveredMovies(results);
            } catch (error) {
                console.error('Failed to discover movies:', error);
            } finally {
                setDiscoveryLoading(false);
            }
        };

        applyFilters();
    }, [selectedGenre, yearFilter, ratingFilter, sortBy, discoverMovies]);

    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            addToSearchHistory(query);
        }
    };

    // Determine which movies to display
    const displayMovies = useMemo(() => {
        if (query.trim()) {
            return searchResults;
        }
        if (discoveredMovies.length > 0) {
            return discoveredMovies;
        }
        return tabMovies;
    }, [query, searchResults, discoveredMovies, tabMovies]);

    const isLoading = searchLoading || tabLoading || discoveryLoading;

    // Clear filters
    const clearFilters = () => {
        setSelectedGenre('');
        setSortBy('popularity.desc');
        setYearFilter('');
        setRatingFilter('');
    };

    // Generate year options (current year to 1950)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

    return (
        <div className="home">
            {/* Search Section */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Search for movies..."
                            className="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className="search-button">
                            🔍
                        </button>
                    </div>
                </form>

                {/* Search History */}
                {searchHistory.length > 0 && !query && (
                    <div className="search-history">
                        <h4>Recent Searches:</h4>
                        <div className="history-tags">
                            {searchHistory.slice(0, 5).map((term, index) => (
                                <button
                                    key={index}
                                    className="history-tag"
                                    onClick={() => setQuery(term)}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter Toggle */}
                <button 
                    className="filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    🎛️ {showFilters ? 'Hide' : 'Show'} Filters
                </button>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="filters-container">
                        <div className="filter-group">
                            <label>Genre:</label>
                            <select 
                                value={selectedGenre} 
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Year:</label>
                            <select 
                                value={yearFilter} 
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Any Year</option>
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Min Rating:</label>
                            <select 
                                value={ratingFilter} 
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Any Rating</option>
                                <option value="7">7+ ⭐</option>
                                <option value="8">8+ ⭐</option>
                                <option value="9">9+ ⭐</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By:</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="popularity.desc">Most Popular</option>
                                <option value="vote_average.desc">Highest Rated</option>
                                <option value="release_date.desc">Newest</option>
                                <option value="release_date.asc">Oldest</option>
                                <option value="title.asc">A-Z</option>
                            </select>
                        </div>

                        <button className="clear-filters" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Category Tabs (only show when not searching or filtering) */}
            {!query.trim() && discoveredMovies.length === 0 && (
                <div className="category-tabs">
                    <button 
                        className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
                        onClick={() => setActiveTab('popular')}
                    >
                        🔥 Popular
                    </button>
                    <button 
                        className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trending')}
                    >
                        📈 Trending
                    </button>
                    <button 
                        className={`tab ${activeTab === 'top_rated' ? 'active' : ''}`}
                        onClick={() => setActiveTab('top_rated')}
                    >
                        ⭐ Top Rated
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner">🎬</div>
                    <p>Loading movies...</p>
                </div>
            )}

            {/* Error State */}
            {tabError && (
                <div className="error-container">
                    <p>❌ {tabError}</p>
                </div>
            )}

            {/* Movies Grid */}
            {!isLoading && (
                <>
                    {displayMovies.length > 0 ? (
                        <div className="movies-grid">
                            {displayMovies.map((movie) => (
                                <MovieCard movie={movie} key={movie.id} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <h3>No movies found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && !query.trim() && discoveredMovies.length === 0 && (
                        <div className="load-more-container">
                            <button 
                                className="load-more-button"
                                onClick={loadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Home;
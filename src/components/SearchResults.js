import React from 'react';
import styles from './SearchResults.module.css';
import TrackList from './TrackList';

function SearchResults({ searchResults = [], onAdd }) {
    return (
        <div className={styles.SearchResults}>
            <h2 className={styles.resultsHeader}>Results</h2>
            <TrackList tracks={searchResults} onAdd={onAdd} />
        </div>
    );
}

export default SearchResults;

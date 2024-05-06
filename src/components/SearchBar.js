import React, { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSearch = () => {
    onSearch(term);
  };

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.inputField}
        placeholder="Enter A Song, Album, or Artist"
        value={term}
        onChange={e => setTerm(e.target.value)}
        onKeyPress={event => event.key === 'Enter' && handleSearch()}
      />
      <button className={styles.searchButton} onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;

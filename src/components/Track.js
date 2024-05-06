import React from 'react';
import styles from './Track.module.css';

function Track({ track, onAdd, onRemove, isRemovable }) {
  return (
    <div className={styles.trackItem}>
      <div className={styles.trackInfo}>
        <h3>{track.name}</h3>
        <p>{track.artist} | {track.album}</p>
      </div>
      {isRemovable ? (
        <button onClick={() => onRemove(track)} className={styles.trackAction}>Remove</button>
      ) : (
        <button onClick={() => onAdd(track)} className={styles.trackAction}>Add</button>
      )}
    </div>
  );
}

export default Track;

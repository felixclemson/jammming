import React from 'react';
import styles from './TrackList.module.css';
import Track from './Track';

function TrackList({ tracks = [], onAdd, onRemove, isRemovable }) {
  return (
    <div className={styles.trackList}>
      {tracks.map(track => (
        <Track key={track.id} track={track} onAdd={isRemovable ? null : onAdd} onRemove={isRemovable ? onRemove : null} isRemovable={isRemovable} />
      ))}
    </div>
  );
}

export default TrackList;


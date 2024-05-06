import React, { useState } from 'react';
import styles from './Playlist.module.css';
import TrackList from './TrackList';
import { getAccessToken } from '../storage.js';

const getUserProfile = async () => {
  try {
    const accessToken = getAccessToken()
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

const createPlaylist = async (userId, playlistName) => {
  try {
    const accessToken = getAccessToken()
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: playlistName,
        description: 'Created with Jammming',
        public: false
      })
    });
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

const addTracksToPlaylist = async (playlistId, tracks) => {
  try {
    const accessToken = getAccessToken()
    const uris = tracks.map((track) => { return track.uri })

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: uris,
      })
    })
  } catch (error) {
    console.error('Error adding tracks to playlist', error);
    return null;
  }
}

const saveToSpotify = async (playlistName, tracks) => {
  if (!playlistName) {
    alert('Please enter a playlist name.');
    return;
  }
  const userId = await getUserProfile();
  if (userId) {
    const playlistId = await createPlaylist(userId, playlistName);
    if (playlistId) {
      console.log(`Playlist created with ID: ${playlistId}`);
      await addTracksToPlaylist(playlistId, tracks);
    }
  }
};

function Playlist({ tracks, onRemove, onClearSearchResults, onReset }) {
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null)

  const handleSaveToSpotify = async () => {
    if (!playlistName) {
      setMessage('Please enter a playlist name.');
      return;
    }
    setLoading(true);
    setMessage('');
    const userId = await getUserProfile();
    if (!userId) {
      setMessage('Failed to fetch user profile');
      setLoading(false);
      return;
    }

    const playlistId = await createPlaylist(userId, playlistName);
    if (!playlistId) {
      setMessage('Failed to create playlist.');
      setLoading(false);
      return;
    }

    const success = await addTracksToPlaylist(playlistId, tracks);
    setLoading(false);
    if (success) {
      setMessage(`Playlist "${playlistName}" created successfully.`);
      onRemove();
      setPlaylistName('');
      onClearSearchResults();
      onReset();
    } else {
      setMessage('Failed to add tracks to playlist.');
    }
    // try to save
    // if successful:
    //    - store message in state
    //    - display message to user
    //    - clear selected tracks?
    //    - clear playlist name?
    // if error:
    //    - store error in state
    //    - display error to user
    // 
    return saveToSpotify(playlistName, tracks);
  };

  if (loading) {
    return <div className={styles.loading}>Saving playlist...</div>;
  }

  return (
    <div className={styles.playlist}>
      <input
        className={styles.playlistNameInput}
        value={playlistName}
        onChange={e => setPlaylistName(e.target.value)}
        placeholder="Enter Playlist Name" />
      <h2 className={styles.playlistHeader}>{playlistName}</h2>
      <TrackList tracks={tracks} onRemove={onRemove} isRemovable={true} />
      <button className={styles.saveButton} onClick={handleSaveToSpotify}>Save to Spotify</button>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}

export default Playlist;
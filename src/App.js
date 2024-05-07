import React, { useCallback, useEffect, useState, useRef } from 'react';
import './App.css';
import styles from './App.module.css';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';
import { storeCodeVerifier, getCodeVerifier, removeCodeVerifier, storeAccessToken, getAccessToken, removeAccessToken, isLoggedIn } from './storage.js';

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const appUri = process.env.APP_URI || 'http://localhost:3000/';

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const getChallenge = async (verifier) => {
  const hashed = await sha256(verifier);
  return base64encode(hashed);
};

const exchangeCodeForToken = async (code) => {
  const codeVerifier = getCodeVerifier();
  const redirectUri = appUri;
  const clientId = 'e5093d568e96427cb30a04d517ece293';

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };

  const response = await fetch('https://accounts.spotify.com/api/token', payload);
  const data = await response.json();

  removeCodeVerifier()

  return data.access_token
};

const searchTracks = async (term) => {
  const accessToken = getAccessToken()
  const url = `https://api.spotify.com/v1/search?q=${term}&type=track&limit=5`;
  const payload = {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }

  const response = await fetch(url, payload)
  const data = await response.json()

  return data
}

const getMyTopTracks = async () => {
  const accessToken = getAccessToken()
  if (accessToken === null) {
    return {
      items: []
    };
  }
  const url = `https://api.spotify.com/v1/me/top/tracks/?limit=3`;
  const payload = {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }

  const response = await fetch(url, payload)
  const data = await response.json()

  return data
}

const handleRequestSpotifyAuthentication = async () => {
  const clientId = 'e5093d568e96427cb30a04d517ece293';
  const redirectUri = appUri;
  const scopes = 'playlist-modify-public playlist-modify-private user-top-read';
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await getChallenge(codeVerifier);
  storeCodeVerifier(codeVerifier)
  const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  window.location.href = spotifyUrl;
};

const getInitialSearchResults = async () => {
  const tracks = await getMyTopTracks()
  console.log(tracks)
  const transformed = tracks.items.map((track) => {
    return {
      id: track.id,
      name: track.name,
      album: track.album.name,
      artist: track.artists[0].name,
      uri: track.uri
    }
  })
  return transformed;
}

function App() {
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [searchResults, setSearchResults] = useState();
  const handledCode = useRef(false)

  const initialiseSearchResults = async () => {
    const initialSearchResults = await getInitialSearchResults()
    setSearchResults(initialSearchResults)
  }

  useEffect(() => {
    initialiseSearchResults()
  }, [])

  useEffect(() => {
    const handleAuthorizationCode = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code && handledCode.current === false) {
        storeAccessToken(await exchangeCodeForToken(code))
        window.location.href = appUri;
      }
    }

    handleAuthorizationCode()

    return () => {
      handledCode.current = true
    }
  }, []);

  const handleDisconnectFromSpotify = useCallback(() => {
    removeAccessToken()
    window.location.href = appUri;
  }, []
  )

  const handleAddTrackToPlaylist = useCallback((trackToAdd) => {
    if (!playlistTracks.some(track => track.id === trackToAdd.id)) {
      setPlaylistTracks([...playlistTracks, trackToAdd]);
    }
  }, [playlistTracks, setPlaylistTracks]);

  const handleRemoveTrackFromPlaylist = useCallback((trackToRemove) => {
    setPlaylistTracks(playlistTracks.filter(track => track.id !== trackToRemove.id));
  }, [playlistTracks, setPlaylistTracks]);

  const handleSearch = useCallback((term) => {
    const searchInBackground = async () => {
      let tracks
      if (!term) {
        tracks = await getMyTopTracks()
      } else {
        tracks = (await searchTracks(term)).tracks
      }
      const transformed = tracks.items.map((track) => {
        return {
          id: track.id,
          name: track.name,
          album: track.album.name,
          artist: track.artists[0].name,
          uri: track.uri
        }
      })
      setSearchResults(transformed)
    }

    searchInBackground()
  }, [setSearchResults]);

  if (isLoggedIn()) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <SearchBar onSearch={handleSearch} />
        </header>
        <div className={styles.mainContent}>
          <SearchResults searchResults={searchResults} onAdd={handleAddTrackToPlaylist} />
          <Playlist
            tracks={playlistTracks}
            onRemove={handleRemoveTrackFromPlaylist}
            onClearSearchResults={() => initialiseSearchResults()}
            onReset={() => { setPlaylistTracks([]) }}
          />
        </div>
        <footer className={styles.footer}>
          <button className={styles.footerButton} onClick={handleDisconnectFromSpotify}>Disconnect Spotify</button>
        </footer>
      </div>
    );
  } else {
    return (
      <div className={styles.connectContainer}>
        <button className={styles.connectButton} onClick={handleRequestSpotifyAuthentication}>Connect to Spotify</button>
      </div>
    );
  }
}

export default App;

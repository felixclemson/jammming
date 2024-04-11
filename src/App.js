import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(currentValue => currentValue + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const authenticateSpotify = () => {
    const clientId = 'e5093d568e96427cb30a04d517ece293'; // Replace with your client ID
    const redirectUri = encodeURIComponent('https://felixclemson.github.io/jammming'); // Make sure this is URL-encoded
    const scopes = encodeURIComponent('playlist-modify-public playlist-read-private'); // Adjust scopes as needed
    const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&show_dialog=true`;
    window.location.href = spotifyUrl;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>The time sponsored by accurist will be: {counter}</p>
        <button onClick={authenticateSpotify}>Connect to Spotify</button>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
import './App.css'
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Playlists from './components/Playlists';
import PlaylistTracks from './components/PlaylistTracks';
import Outfit from './components/Outfit';
import { generateOutfit } from './utils/algorithm';

const App = () => {
  const [token, setToken] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [genres, setGenres] = useState([]);
  const [outfitData, setOutfitData] = useState(null);

  useEffect(() => {
    // Получаем token из URL после редиректа от Spotify
    const hash = window.location.hash;
    let tokenFromUrl = '';
    if (hash) {
      tokenFromUrl = hash.substring(1).split('&')
        .find(elem => elem.startsWith('access_token'))
        .split('=')[1];
      setToken(tokenFromUrl);
      window.location.hash = '';
    }
  }, []);

  // Когда жанры получены, генерируем образ
  useEffect(() => {
    if (genres.length > 0) {
      const data = generateOutfit(genres);
      setOutfitData(data);
    }
  }, [genres]);

  if (!token) return <Login />;

  return (
    <div>
      <h1>Spotify Outfit Generator</h1>
      {!selectedPlaylist ? (
        <Playlists token={token} onSelectPlaylist={setSelectedPlaylist} />
      ) : (
        <div>
          <PlaylistTracks token={token} playlistId={selectedPlaylist} onGenresExtracted={setGenres} />
          {outfitData && <Outfit outfitData={outfitData} />}
        </div>
      )}
    </div>
  );
};

export default App;


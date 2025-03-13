import React, { useEffect, useState } from 'react';

const Playlists = ({ token, onSelectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setPlaylists(data.items))
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div>
      <h2>Ваши плейлисты</h2>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id} onClick={() => onSelectPlaylist(playlist.id)}>
            {playlist.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlists;

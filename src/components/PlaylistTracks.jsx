import React, { useEffect, useState } from 'react';

const PlaylistTracks = ({ token, playlistId, onGenresExtracted }) => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setTracks(data.items);
        // Для каждого трека извлекаем id исполнителя и получаем жанры
        const artistIds = data.items.map(item => item.track.artists[0].id);
        const uniqueArtistIds = [...new Set(artistIds)];
        Promise.all(
          uniqueArtistIds.map(id =>
            fetch(`https://api.spotify.com/v1/artists/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
          )
        ).then(artistsData => {
          const genres = artistsData.flatMap(artist => artist.genres);
          onGenresExtracted(genres);
        });
      })
      .catch(err => console.error(err));
  }, [token, playlistId, onGenresExtracted]);

  return (
    <div>
      <h2>Треки плейлиста</h2>
      <ul>
        {tracks.map(item => (
          <li key={item.track.id}>{item.track.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistTracks;

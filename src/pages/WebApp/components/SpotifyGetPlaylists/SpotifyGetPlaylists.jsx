import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SpotifyGetPlaylists.css";

const PLAYLISTS_ENDPOINT = "https://api.spotify.com/v1/me/playlists";

const SpotifyGetPlaylists = () => {
  const [token, setToken] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  const handleGetPlaylists = () => {
    axios
      .get(PLAYLISTS_ENDPOINT, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setData(response.data.items || []);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <button className="fetch-button" onClick={handleGetPlaylists}>
        Get Playlists
      </button>
      <div className="playlists-container">
        {data.map((playlist) => (
          <div key={playlist.id} className="playlist-card">
            <img
              src={playlist.images?.[0]?.url || "https://via.placeholder.com/150"}
              alt={playlist.name}
              className="playlist-image"
            />
            <div className="playlist-name" title={playlist.name}>{playlist.name.length > 20 ? playlist.name.slice(0, 20) + '...' : playlist.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpotifyGetPlaylists;

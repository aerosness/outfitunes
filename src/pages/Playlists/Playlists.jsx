import React from "react";
import SpotifyGetPlaylists from "../../components/SpotifyGetPlaylists/SpotifyGetPlaylists";
import "./Playlists.css";

const Playlists = () => {
  return (
    <div className="playlists-page">
      <h1>Ваши плейлисты</h1>
      <SpotifyGetPlaylists />
    </div>
  );
};

export default Playlists;

import React from "react";
import SpotifyGetPlaylists from "../../components/SpotifyGetPlaylists/SpotifyGetPlaylists";
import "./Playlists.css";

const Playlists = () => {
  return (
    <div className="playlists-page">
      <SpotifyGetPlaylists />
    </div>
  );
};

export default Playlists;

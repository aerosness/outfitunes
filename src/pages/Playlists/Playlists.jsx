import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/Footer"
import "./Playlists.css";
import * as ROUTES from "../../constants/routes";

const PLAYLISTS_ENDPOINT = "https://api.spotify.com/v1/me/playlists";

const Playlists = () => {
  const [token, setToken] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setToken(accessToken);
      fetchPlaylists(accessToken);
    }
  }, []);

  const fetchPlaylists = (accessToken = token) => {
    if (!accessToken) {
      console.error("No token! Please log in first.");
      return;
    }
    axios
      .get(PLAYLISTS_ENDPOINT, {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Accept-Language": "en",
        },
      })
      .then((response) => {
        setData(response.data.items || []);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(ROUTES.OUTFIT, {
      state: { playlistId },
    });
  };

  return (
    <div className="playlists-wrapper">
      <div className="playlists-container-inner">
        <h1 className="page-title">Your Playlists</h1>

        <button className="fetch-button" onClick={() => fetchPlaylists()}>
          Reload Playlists
        </button>

        <div className="playlists-container">
          {data.map((playlist) => (
            <div
              key={playlist.id}
              className="playlist-card"
              onClick={() => handlePlaylistClick(playlist.id)}
            >
              <img
                src={playlist.images?.[0]?.url || "https://via.placeholder.com/150"}
                alt={playlist.name}
                className="playlist-image"
              />
              <div className="playlist-name" title={playlist.name}>
                {playlist.name.length > 20 ? playlist.name.slice(0, 20) + "..." : playlist.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Playlists;

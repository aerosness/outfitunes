import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import "./Registration.css";

const CLIENT_ID = "6742a45a680a410e8e0e0cda6297993c";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = "http://localhost:5173";
const SPACE_DELIMITER = "%20";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "playlist-read-private",
];
const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMITER);

// Функция для парсинга хэша (access_token, token_type, expires_in)
const getReturnedParamsFromSpotifyAuth = (hash) => {
  const stringAfterHash = hash.substring(1);
  const paramsInUrl = stringAfterHash.split("&"); 
  const paramsSplitUp = paramsInUrl.reduce((acc, currentValue) => {
    const [key, value] = currentValue.split("=");
    acc[key] = value;
    return acc;
  }, {});

  return paramsSplitUp;
};

const Registration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, есть ли хэш с токеном после редиректа от Spotify
    if (window.location.hash) {
      const { access_token, expires_in, token_type } =
        getReturnedParamsFromSpotifyAuth(window.location.hash);
      localStorage.clear();

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("tokenType", token_type);
      localStorage.setItem("expiresIn", expires_in);

      navigate(ROUTES.PLAYLISTS);
    }
  }, [navigate]);

  const handleLogin = () => {
    //URL для авторизации
    window.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`;
  };

  const before = "before:content-[''] before:absolute before:inset-0 before:w-full before:h-full before:bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] before:bg-[size:100%_4px] before:opacity-50 before:pointer-events-none"

  return (
    <div className={`image-container ${before}`}>
      <div className={`registration-container`}>
        <h1>Registration (Spotify Login)</h1>
        <button onClick={handleLogin}>Connect Spotify</button>
      </div>
    </div>
  );
};

export default Registration;

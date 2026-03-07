import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Footer from "../../components/Footer";
import "./Registration.css";
import { Helmet } from "react-helmet";

const CLIENT_ID = "6742a45a680a410e8e0e0cda6297993c";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = window.location.origin.replace("localhost", "127.0.0.1");
const SCOPES = ["playlist-read-private"];
const canonicalUrl = "https://www.outfitunes.com/";

const generateRandomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
};

const base64urlencode = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const generateCodeChallenge = async (verifier) => {
  const hashed = await sha256(verifier);
  return base64urlencode(hashed);
};

const exchangeCodeForToken = async (code, codeVerifier) => {
  console.log("redirect_uri being sent:", REDIRECT_URL_AFTER_LOGIN);
  console.log("code:", code);
  console.log("verifier:", codeVerifier);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URL_AFTER_LOGIN,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });
  return response.json();
};

const Registration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const codeVerifier = localStorage.getItem("pkce_code_verifier");

    if (code && codeVerifier) {
      exchangeCodeForToken(code, codeVerifier).then((data) => {
        if (data.access_token) {
          localStorage.clear();
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("tokenType", data.token_type);
          localStorage.setItem("expiresIn", data.expires_in);
          if (data.refresh_token) {
            localStorage.setItem("refreshToken", data.refresh_token);
          }
          // Clean up URL
          window.history.replaceState({}, "", window.location.origin);
          navigate(ROUTES.PLAYLISTS);
        } else {
          console.error("Token exchange failed:", data);
        }
      });
    }
  }, [navigate]);

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("pkce_code_verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URL_AFTER_LOGIN,
      scope: SCOPES.join(" "),
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      show_dialog: "true",
    });

    window.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?${params.toString()}`;
  };

  return (
    <div className="registration-wrapper">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <img src="/resources/img/register/vest.png" className="deco vest" alt="vest" />
      <img src="/resources/img/register/acics.png" className="deco acics" alt="acics" />
      <img src="/resources/img/register/jeans.png" className="deco jeans" alt="jeans" />
      <img src="/resources/img/register/hoodie.png" className="deco hoodie" alt="hoodie" />
      <img src="/resources/img/register/shirt.png" className="deco shirt" alt="shirt" />
      <img src="/resources/img/register/brace.png" className="deco brace" alt="brace" />
      <div className="registration-container">
        <h1>YOUR <br /> SPOTIFY <br /> OUTFIT</h1>
        <p>Find out what your Spotify outfit looks like based on your music taste.</p>
        <button className="spotify-button" onClick={handleLogin}>
          <img src="/resources/img/spotifylogo.png" alt="Spotify" />
          Connect Spotify
        </button>
        <p className="note">ℹ️ Make sure you're not in incognito</p>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
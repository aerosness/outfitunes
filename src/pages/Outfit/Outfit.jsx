import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import genresData from "../../constants/genres_dict.json";
import "./Outfit.css";

const PLAYLIST_TRACKS_ENDPOINT = (playlistId) =>
  `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
const ARTISTS_ENDPOINT = (ids) =>
  `https://api.spotify.com/v1/artists?ids=${ids}`;

const { genres_map } = genresData;

function unifyGenre(spotifyGenre) {
  if (!spotifyGenre) return null;
  const lowerGenre = spotifyGenre.toLowerCase();

  for (const mainGenre of Object.keys(genres_map)) {
    const subgenres = genres_map[mainGenre];
    if (!Array.isArray(subgenres)) continue;
    if (subgenres.some((sub) => sub.toLowerCase() === lowerGenre)) {
      return mainGenre;
    }
  }

  return null;
}

async function fetchOutfitFiles(basePath, folder) {
  try {
    const response = await axios.get(`${basePath}/${folder}/`);
    return response.data.files || [];
  } catch (error) {
    console.warn(`Error loading files for ${folder}:`, error);
    return [];
  }
}

function randomFile(filesArray) {
  if (filesArray.length === 0) return null;
  const randIndex = Math.floor(Math.random() * filesArray.length);
  return filesArray[randIndex];
}

const Outfit = () => {
  const [token, setToken] = useState("");
  const [mainGenre, setMainGenre] = useState(null);
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const playlistId = state?.playlistId;

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  useEffect(() => {
    if (!token || !playlistId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const resp = await axios.get(PLAYLIST_TRACKS_ENDPOINT(playlistId), {
          headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en" },
        });
        const items = resp.data.items || [];

        const artistIdsSet = new Set();
        items.forEach((item) => {
          const track = item.track;
          if (track && track.artists) {
            track.artists.forEach((artist) => artistIdsSet.add(artist.id));
          }
        });
        const artistIdsArray = Array.from(artistIdsSet);

        if (artistIdsArray.length === 0) {
          console.warn("No artists found in the playlist.");
          setLoading(false);
          return;
        }

        const chunkSize = 50;
        let allArtists = [];
        for (let i = 0; i < artistIdsArray.length; i += chunkSize) {
          const chunk = artistIdsArray.slice(i, i + chunkSize);
          const artistsResp = await axios.get(ARTISTS_ENDPOINT(chunk.join(",")), {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en" },
          });
          allArtists = allArtists.concat(artistsResp.data.artists || []);
        }

        const genreCount = {};
        allArtists.forEach((artist) => {
          const artistGenres = artist.genres || [];
          artistGenres.forEach((g) => {
            const unified = unifyGenre(g);
            if (unified) {
              genreCount[unified] = (genreCount[unified] || 0) + 1;
            }
          });
        });

        let topGenre = null;
        let maxCount = 0;
        Object.keys(genreCount).forEach((g) => {
          if (genreCount[g] > maxCount) {
            topGenre = g;
            maxCount = genreCount[g];
          }
        });

        setMainGenre(topGenre);
      } catch (error) {
        console.error("Error fetching playlist/artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, playlistId]);

  useEffect(() => {
    if (!mainGenre) return;

    const basePath = `/resources/outfit/${mainGenre.toLowerCase()}`;

    const loadOutfit = async () => {
      const topFiles = await fetchOutfitFiles(basePath, "top");
      const bottomFiles = await fetchOutfitFiles(basePath, "bottom");
      const shoesFiles = await fetchOutfitFiles(basePath, "shoes");
      const accessoriesFiles = await fetchOutfitFiles(basePath, "accessories");

      setOutfit({
        top: randomFile(topFiles),
        bottom: randomFile(bottomFiles),
        shoes: randomFile(shoesFiles),
        accessories: [
          randomFile(accessoriesFiles),
          randomFile(accessoriesFiles),
        ].filter(Boolean),
      });
    };

    loadOutfit();
  }, [mainGenre]);

  return (
    <div className="outfit-page">
      <h1>Your Outfit</h1>

      {!playlistId && <p>No playlist selected.</p>}
      {loading && <p>Loading data…</p>}

      {!loading && !mainGenre && (
        <p>
          Could not determine a genre (maybe your taste is too unique or your playlist is too short).
          <br />
          <a href="http://localhost:5173/playlists">Try another playlist.</a>
        </p>
      )}

      {mainGenre && outfit && (
        <div className="outfit-container">
          <h2>Detected Genre: {mainGenre}</h2>
          <div className="outfit-item">
            <span>Top:</span>
            {outfit.top ? <img src={outfit.top} alt="top" /> : <p>No data</p>}
          </div>
          <div className="outfit-item">
            <span>Bottom:</span>
            {outfit.bottom ? <img src={outfit.bottom} alt="bottom" /> : <p>No data</p>}
          </div>
          <div className="outfit-item">
            <span>Shoes:</span>
            {outfit.shoes ? <img src={outfit.shoes} alt="shoes" /> : <p>No data</p>}
          </div>
          <div className="outfit-item">
            <span>Accessories:</span>
            {outfit.accessories.length > 0 ? (
              outfit.accessories.map((acc, idx) => <img key={idx} src={acc} alt={`accessory-${idx}`} />)
            ) : (
              <p>No accessories</p>
            )}
          </div>
          <a href="http://localhost:5173/playlists">back</a>
        </div>
      )}
    </div>
  );
};

export default Outfit;

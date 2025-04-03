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

// Maximum number of images to check for each category
const MAX_IMAGES_TO_CHECK = 10;

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

// Check if an image exists
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Find all available images in a category
async function findAvailableImages(genre, category) {
  const availableImages = [];
  
  for (let i = 1; i <= MAX_IMAGES_TO_CHECK; i++) {
    const imgPath = `/outfit/${genre}/${category}/${i}.png`;
    const exists = await checkImageExists(imgPath);
    
    if (exists) {
      availableImages.push(`${i}.png`);
    }
  }
  
  return availableImages;
}

// Get two different random items if possible
function getTwoRandomItems(array) {
  if (array.length === 0) return [];
  if (array.length === 1) return [array[0]];
  
  // Get first random item
  const index1 = Math.floor(Math.random() * array.length);
  const item1 = array[index1];
  
  // Remove the first item and get second random item
  const remainingItems = array.filter((_, idx) => idx !== index1);
  const index2 = Math.floor(Math.random() * remainingItems.length);
  const item2 = remainingItems[index2];
  
  return [item1, item2];
}

// Get one random item from array
function getRandomItem(array) {
  if (array.length === 0) return null;
  const randIndex = Math.floor(Math.random() * array.length);
  return array[randIndex];
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
      console.log("Access token found:", accessToken);
      setToken(accessToken);
    }
  }, []);

  useEffect(() => {
    if (!token || !playlistId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching playlist tracks...");
        const resp = await axios.get(PLAYLIST_TRACKS_ENDPOINT(playlistId), {
          headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en" },
        });
        console.log("Playlist tracks fetched:", resp.data);
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

        console.log("Fetching artist genres...");
        const chunkSize = 50;
        let allArtists = [];
        for (let i = 0; i < artistIdsArray.length; i += chunkSize) {
          const chunk = artistIdsArray.slice(i, i + chunkSize);
          const artistsResp = await axios.get(ARTISTS_ENDPOINT(chunk.join(",")), {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en" },
          });
          allArtists = allArtists.concat(artistsResp.data.artists || []);
        }
        console.log("Artists fetched:", allArtists);

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
        console.log("Genre count:", genreCount);

        let topGenre = null;
        let maxCount = 0;
        Object.keys(genreCount).forEach((g) => {
          if (genreCount[g] > maxCount) {
            topGenre = g;
            maxCount = genreCount[g];
          }
        });
        console.log("Top genre detected:", topGenre);

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
    
    const formattedGenre = mainGenre.toLowerCase().replace(/\s+/g, '');
    console.log(`Formatted genre path: ${formattedGenre}`);
    
    const loadOutfit = async () => {
      try {
        // Find all available images for each category
        const topFiles = await findAvailableImages(formattedGenre, "top");
        const bottomFiles = await findAvailableImages(formattedGenre, "bottom");
        const shoesFiles = await findAvailableImages(formattedGenre, "shoes");
        const accessoriesFiles = await findAvailableImages(formattedGenre, "accessories");
        
        console.log("Available files:", { topFiles, bottomFiles, shoesFiles, accessoriesFiles });
        
        // Select random items for each category
        const randomTop = getRandomItem(topFiles);
        const randomBottom = getRandomItem(bottomFiles);
        const randomShoes = getRandomItem(shoesFiles);
        const randomAccessories = getTwoRandomItems(accessoriesFiles);
        
        setOutfit({
          top: randomTop ? `/outfit/${formattedGenre}/top/${randomTop}` : null,
          bottom: randomBottom ? `/outfit/${formattedGenre}/bottom/${randomBottom}` : null,
          shoes: randomShoes ? `/outfit/${formattedGenre}/shoes/${randomShoes}` : null,
          accessories: randomAccessories.map(file => `/outfit/${formattedGenre}/accessories/${file}`),
        });
      } catch (error) {
        console.error("Error loading outfit:", error);
      }
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

          <button onClick={() => window.location.reload()}>reload</button>
          <a href="http://localhost:5173/playlists">back</a>
        </div>
      )}
    </div>
  );
};

export default Outfit;
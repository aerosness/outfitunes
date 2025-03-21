// src/pages/Outfit/Outfit.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Outfit.css";

// Импортируем JSON. Предположим, что файл лежит в src/constants/genres_dict.json
import genresData from "../../constants/genres_dict.json";

const PLAYLIST_TRACKS_ENDPOINT = (playlistId) =>
  `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
const ARTISTS_ENDPOINT = (ids) =>
  `https://api.spotify.com/v1/artists?ids=${ids}`;

// 1. Достаём массив основных жанров (genres) и объект с маппингом sub-жанров (genres_map)
const { genres, genres_map } = genresData;

/**
 * Функция unifyGenre
 * 1. Проверяет, есть ли в genres_map точное совпадение субжанра (из Spotify) с одним из массивов.
 * 2. Если не находит, применяет эвристику (ключевые слова) для определения ближайшего основного жанра.
 * 3. Если вообще ничего не подошло — возвращает null.
 */
function unifyGenre(spotifyGenre) {
  if (!spotifyGenre) return null;
  const lowerGenre = spotifyGenre.toLowerCase();

  // 1. Пытаемся найти точное совпадение в genres_map
  for (const mainGenre of Object.keys(genres_map)) {
    // genres_map[mainGenre] — это массив субжанров (строк)
    const subgenres = genres_map[mainGenre];
    if (!Array.isArray(subgenres)) continue;

    // Проверяем, есть ли точное совпадение
    const foundExact = subgenres.some(
      (sub) => sub.toLowerCase() === lowerGenre
    );
    if (foundExact) {
      return mainGenre; // возвращаем, например, "Pop", "Electronic" и т.д.
    }
  }

  // 2. Если точного совпадения не нашлось — пробуем эвристику
  // (Можно расширить, чтобы находить ключевые слова типа "metal", "rock" и т.п.)
  if (lowerGenre.includes("pop")) return "Pop";
  if (lowerGenre.includes("electronic") || lowerGenre.includes("edm") || lowerGenre.includes("house")) {
    return "Electronic";
  }
  if (lowerGenre.includes("hip hop") || lowerGenre.includes("rap") || lowerGenre.includes("trap")) {
    return "Hip Hop";
  }
  if (lowerGenre.includes("r&b")) return "R&B";
  if (lowerGenre.includes("latin")) return "Latin";
  if (lowerGenre.includes("rock")) return "Rock";
  if (lowerGenre.includes("metal")) return "Metal";
  if (lowerGenre.includes("country")) return "Country";
  if (lowerGenre.includes("folk") || lowerGenre.includes("acoustic")) return "Folk/Acoustic";
  if (lowerGenre.includes("classical")) return "Classical";
  if (lowerGenre.includes("jazz")) return "Jazz";
  if (lowerGenre.includes("blues")) return "Blues";
  if (lowerGenre.includes("easy listening")) return "Easy listening";
  if (lowerGenre.includes("new age")) return "New age";
  if (lowerGenre.includes("world")) return "World/Traditional";
  // ...

  // 3. Если ничего не подошло — вернём null
  return null;
}

// Для выбора случайного файла из папки
function randomFile(basePath, folder, filesArray) {
  const randIndex = Math.floor(Math.random() * filesArray.length);
  return `${basePath}/${folder}/${filesArray[randIndex]}`;
}

const Outfit = () => {
  const [token, setToken] = useState("");
  const [mainGenre, setMainGenre] = useState(null);
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const playlistId = state?.playlistId;

  // Наборы файлов для каждой части аутфита (пример)
  const outfitFiles = {
    top: ["1.png", "2.png", "3.png"],
    down: ["1.png", "2.png", "3.png"],
    shoes: ["1.png", "2.png", "3.png"],
    accessories: ["1.png", "2.png", "3.png", "4.png", "5.png"],
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  // Загружаем данные плейлиста -> собираем артисты -> определяем жанр
  useEffect(() => {
    if (!token || !playlistId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Получаем треки
        const resp = await axios.get(PLAYLIST_TRACKS_ENDPOINT(playlistId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = resp.data.items || [];

        // 2. Собираем уникальные artistId
        const artistIdsSet = new Set();
        items.forEach((item) => {
          const track = item.track;
          if (track && track.artists) {
            track.artists.forEach((artist) => artistIdsSet.add(artist.id));
          }
        });
        const artistIdsArray = Array.from(artistIdsSet);

        if (artistIdsArray.length === 0) {
          console.warn("Нет артистов в плейлисте");
          setLoading(false);
          return;
        }

        // 3. Разбиваем на пачки по 50 (лимит Spotify)
        const chunkSize = 50;
        let allArtists = [];
        for (let i = 0; i < artistIdsArray.length; i += chunkSize) {
          const chunk = artistIdsArray.slice(i, i + chunkSize);
          const artistsResp = await axios.get(ARTISTS_ENDPOINT(chunk.join(",")), {
            headers: { Authorization: `Bearer ${token}` },
          });
          allArtists = allArtists.concat(artistsResp.data.artists || []);
        }

        // 4. Подсчитываем самые частые основные жанры
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

        // Находим жанр с maxCount
        let topGenre = null;
        let maxCount = 0;
        Object.keys(genreCount).forEach((g) => {
          if (genreCount[g] > maxCount) {
            topGenre = g;
            maxCount = genreCount[g];
          }
        });

        setMainGenre(topGenre); // Если жанр не нашёлся, будет null
      } catch (error) {
        console.error("Ошибка при загрузке плейлиста/артистов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, playlistId]);

  // Когда жанр определён, формируем аутфит
  useEffect(() => {
    if (!mainGenre) return;

    // Допустим, мы храним папки по названию основного жанра в lowerCase:
    // /public/resources/outfit/pop, /public/resources/outfit/electronic и т.д.
    const basePath = `/resources/outfit/${mainGenre.toLowerCase()}`;

    const chosenOutfit = {
      top: randomFile(basePath, "top", outfitFiles.top),
      down: randomFile(basePath, "down", outfitFiles.down),
      shoes: randomFile(basePath, "shoes", outfitFiles.shoes),
      accessories: [
        randomFile(basePath, "accessories", outfitFiles.accessories),
        randomFile(basePath, "accessories", outfitFiles.accessories),
      ],
    };

    setOutfit(chosenOutfit);
  }, [mainGenre]);

  return (
    <div className="outfit-page">
      <h1>Ваш аутфит</h1>

      {!playlistId && <p>Плейлист не выбран.</p>}
      {loading && <p>Загрузка данных…</p>}

      {!loading && !mainGenre && (
        <p>
          Не удалось определить жанр (возможно, слишком необычный вкус).
          <br />
          Попробуйте другой плейлист.
        </p>
      )}

      {mainGenre && outfit && (
        <div className="outfit-container">
          <h2>Определённый жанр: {mainGenre}</h2>
          <div className="outfit-item">
            <span>Топ:</span>
            <img src={outfit.top} alt="top" />
          </div>
          <div className="outfit-item">
            <span>Низ:</span>
            <img src={outfit.down} alt="down" />
          </div>
          <div className="outfit-item">
            <span>Обувь:</span>
            <img src={outfit.shoes} alt="shoes" />
          </div>
          <div className="outfit-item">
            <span>Аксессуары:</span>
            {outfit.accessories.map((acc, idx) => (
              <img key={idx} src={acc} alt={`accessory-${idx}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Outfit;

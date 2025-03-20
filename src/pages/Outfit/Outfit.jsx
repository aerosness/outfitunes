import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Outfit.css";

const PLAYLIST_TRACKS_ENDPOINT = (playlistId) =>
  `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
const ARTISTS_ENDPOINT = (ids) =>
  `https://api.spotify.com/v1/artists?ids=${ids}`;

// Пример "карты" жанров, чтобы приводить их к основным
const GENRE_MAP = {
  // ключ: поджанр, значение: наш "основной" жанр
  pop: "pop",
  "pop rock": "pop",
  "dance pop": "pop",
  // можно продолжать
  rap: "rap",
  "hip hop": "rap",
  "trap latino": "rap",
  // ...
  rock: "rock",
  metal: "rock",
  "alternative rock": "rock",
  // ...
  electronic: "electronic",
  edm: "electronic",
  "house techno": "electronic",
  // ...
};

// Функция, которая "приводит" жанр из Spotify к одному из основных
function unifyGenre(genre) {
  // В идеале сделать поиск по ключам GENRE_MAP более гибким
  // Например, найти жанр, который содержит в себе слово "rock"
  // Ниже — упрощённый вариант
  const lower = genre.toLowerCase();

  // 1) Сразу проверим, есть ли точное совпадение
  if (GENRE_MAP[lower]) {
    return GENRE_MAP[lower];
  }

  // 2) Или ищем подстроки (пример)
  if (lower.includes("rock")) return "rock";
  if (lower.includes("metal")) return "rock";
  if (lower.includes("rap") || lower.includes("hip hop")) return "rap";
  if (lower.includes("pop")) return "pop";
  if (lower.includes("electronic") || lower.includes("edm")) return "electronic";
  // и т.д.

  // Если ничего не подошло, вернём null (или "other")
  return null;
}

const Outfit = () => {
  const [token, setToken] = useState("");
  const [mainGenre, setMainGenre] = useState(null);
  const [outfit, setOutfit] = useState(null); // тут сохраним пути к картинкам
  const { state } = useLocation();
  const playlistId = state?.playlistId;

  // 1. Достаём токен
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  // 2. Как только у нас есть token и playlistId — загружаем треки и вычисляем жанр
  useEffect(() => {
    if (!token || !playlistId) return;

    const fetchData = async () => {
      try {
        // Шаг 1: Получить треки плейлиста
        const tracksResp = await axios.get(PLAYLIST_TRACKS_ENDPOINT(playlistId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = tracksResp.data.items || [];

        // Собираем все artistId в Set (чтобы не дублировать)
        const artistIdsSet = new Set();
        items.forEach((item) => {
          const track = item.track;
          if (track && track.artists) {
            track.artists.forEach((artist) => artistIdsSet.add(artist.id));
          }
        });
        const artistIdsArray = Array.from(artistIdsSet);

        if (artistIdsArray.length === 0) {
          console.log("Нет артистов в плейлисте");
          return;
        }

        // Шаг 2: Запрашиваем детали артистов (сразу кучей)
        // max 50 за раз (Spotify ограничивает). Если больше, придётся бить на куски.
        const artistsResp = await axios.get(
          ARTISTS_ENDPOINT(artistIdsArray.slice(0, 50).join(",")),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const artists = artistsResp.data.artists || [];

        // Шаг 3: Считаем частоту "основных жанров"
        const genreCount = {};
        artists.forEach((artist) => {
          if (artist.genres) {
            artist.genres.forEach((g) => {
              const unified = unifyGenre(g);
              if (unified) {
                genreCount[unified] = (genreCount[unified] || 0) + 1;
              }
            });
          }
        });

        // Находим самый популярный жанр
        let topGenre = null;
        let maxCount = 0;
        Object.keys(genreCount).forEach((g) => {
          if (genreCount[g] > maxCount) {
            topGenre = g;
            maxCount = genreCount[g];
          }
        });

        // Если ничего не нашли, значит "слишком необычный вкус" :)
        if (!topGenre) {
          setMainGenre(null);
          return;
        }

        setMainGenre(topGenre);
      } catch (err) {
        console.error("Ошибка при загрузке треков/артистов:", err);
      }
    };

    fetchData();
  }, [token, playlistId]);

  // 3. Как только у нас появился mainGenre — формируем аутфит
  useEffect(() => {
    if (!mainGenre) return;

    // Пример: в папке public/resources/outfit/[mainGenre]/...
    // Собираем пути к файлам. Можно взять рандомный, можно хардкодить.
    // Для примера берём что-то фиксированное:
    const basePath = `/resources/outfit/${mainGenre}`;
    const randomFile = (folder) => {
      // Тут можешь хранить список файлов, или делать запрос к серверу, или
      // держать в коде массив ["1.png", "2.png", ...]. Для упрощения — хардкод.
      const candidates = ["1.png", "2.png", "3.png"];
      const rand = Math.floor(Math.random() * candidates.length);
      return `${basePath}/${folder}/${candidates[rand]}`;
    };

    const chosenOutfit = {
      top: randomFile("top"),
      down: randomFile("down"),
      shoes: randomFile("shoes"),
      accessories: [
        randomFile("accessories"),
        randomFile("accessories"), // два аксессуара
      ],
    };

    setOutfit(chosenOutfit);
  }, [mainGenre]);

  return (
    <div className="outfit-page">
      <h1>Ваш аутфит</h1>

      {!playlistId && <p>Плейлист не выбран.</p>}

      {!mainGenre && (
        <p>
          Не удалось определить жанр (либо слишком необычный вкус).
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

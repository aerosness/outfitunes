import React, { useState, useEffect } from 'react';

// Этот компонент получает token в качестве пропса и показывает информацию о текущем пользователе Spotify
const Spotify = ({ token }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Функция для запроса данных пользователя
  const fetchUserData = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Ошибка при получении данных пользователя');
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!userData) {
    return <div>Загрузка информации о пользователе...</div>;
  }

  return (
    <div>
      <h2>Добро пожаловать, {userData.display_name}!</h2>
      {userData.images && userData.images.length > 0 && (
        <img src={userData.images[0].url} alt="avatar" width={100} />
      )}
      <p>Email: {userData.email}</p>
      {/* Здесь можно добавить дополнительные запросы к API или методы для работы с данными Spotify */}
    </div>
  );
};

export default Spotify;

// Пример таблицы соответствий жанров и элементов одежды
const genreToOutfitMap = {
    rock: { top: 'Кожаная куртка', bottom: 'Темные джинсы', accessory: 'Серьги' },
    pop: { top: 'Яркий свитер', bottom: 'Легкие брюки', accessory: 'Браслет' },
    hiphop: { top: 'Оверсайз футболка', bottom: 'Спортивные штаны', accessory: 'Кроссовки' },
    electronic: { top: 'Футуристическая куртка', bottom: 'Строгие брюки', accessory: 'Очки' },
    indie: { top: 'Базовая рубашка', bottom: 'Узкие джинсы', accessory: 'Часы' },
    // Можно добавить и другие жанры
  };
  
  // Функция для анализа жанров и генерации образа
  export const generateOutfit = (genres) => {
    // Подсчёт частоты жанров
    const genreCount = genres.reduce((acc, genre) => {
      const key = genre.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  
    // Находим наиболее часто встречающийся жанр, который есть в нашей таблице
    let selectedGenre = null;
    let maxCount = 0;
    Object.keys(genreCount).forEach(genre => {
      if (genreToOutfitMap[genre] && genreCount[genre] > maxCount) {
        maxCount = genreCount[genre];
        selectedGenre = genre;
      }
    });
  
    // Если подходящий жанр найден, вернуть соответствующий образ
    if (selectedGenre) {
      return {
        genre: selectedGenre,
        outfit: genreToOutfitMap[selectedGenre]
      };
    }
    // Иначе можно вернуть образ по умолчанию или объединить несколько жанров
    return {
      genre: 'default',
      outfit: { top: 'Классическая рубашка', bottom: 'Чиносы', accessory: 'Нейтральные кеды' }
    };
  };
  
import React from 'react';

const Outfit = ({ outfitData }) => {
  if (!outfitData) return null;

  return (
    <div>
      <h2>Сгенерированный образ</h2>
      <p>Жанр: {outfitData.genre}</p>
      <ul>
        <li>Верх: {outfitData.outfit.top}</li>
        <li>Низ: {outfitData.outfit.bottom}</li>
        <li>Аксессуар: {outfitData.outfit.accessory}</li>
      </ul>
    </div>
  );
};

export default Outfit;

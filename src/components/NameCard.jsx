import React from 'react';

const NameCard = ({ nameObj, onClick, onSpell, onFavorite, isSpeaking, isFavorite }) => (
  <div className={`name-card ${nameObj.gender} ${isFavorite ? 'favorite' : ''}`}onClick={() => onClick(nameObj)}>
    <div className="name-header">
      <h2 className="name-title">
        {nameObj.name} <span className="star-icon">✨</span>
      </h2>
      <div className="name-card-buttons">
        <button
          className={`audio-button ${isSpeaking ? 'speaking' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSpell(nameObj.name); }}
          aria-label={`Listen to ${nameObj.name} spelled out`}
          disabled={isSpeaking}
        >
          🔊
        </button>
        <button
          className="favorite-button"
          onClick={(e) => { e.stopPropagation(); onFavorite(nameObj.name); }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
    </div>
    <div className="name-details">
      <div className="name-detail">
        <span className="detail-icon">🔊</span>
        <span className="detail-text">{nameObj.pronunciation}</span>
      </div>
      <div className="name-detail">
        <span className="detail-icon">📚</span>
        <span className="detail-text">{nameObj.meaning}</span>
      </div>
      <div className="name-detail">
        <span className="detail-icon">🌐</span>
        <span className="detail-text">{nameObj.origin}</span>
      </div>
      <div className="name-detail gender-detail">
        <span className="detail-icon">
          {nameObj.gender === 'female' ? '👧' : nameObj.gender === 'male' ? '👦' : '🧒'}
        </span>
        <span className="detail-text">
          {nameObj.gender === 'female' ? 'Girl' : nameObj.gender === 'male' ? 'Boy' : 'Unisex'}
        </span>
      </div>
    </div>
  </div>
);

export default NameCard;

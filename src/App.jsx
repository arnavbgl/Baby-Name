import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import Header from "./components/Header.jsx";
import NameCard from "./components/NameCard.jsx";
import babyNamesData from './data/babyNamesData.json';
import "./App.css";

const NameModal = lazy(() => import('./components/NameModal.jsx'));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState('Discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermOrigin, setSearchTermOrigin] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [displayedNames, setDisplayedNames] = useState([]);
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedName, setSelectedName] = useState(null);
  const [isDiscoverPopulated, setIsDiscoverPopulated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [geminiNames, setgeminiNames] = useState([]);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [allNames, setAllNames] = useState(babyNamesData);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites'));
    if (savedFavorites) {
      setFavorites(savedFavorites);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const filteredNames = useMemo(() => {
    if (!allNames[activeTheme] || allNames[activeTheme].length === 0) return [];
    let filtered = allNames[activeTheme];
    const term = searchTerm.toLowerCase().trim();
    const originTerm = searchTermOrigin.toLowerCase().trim();

    if (genderFilter !== 'all') {
      filtered = filtered.filter(nameObj => nameObj.gender === genderFilter);
    }
    if (term) {
      filtered = filtered.filter(nameObj =>
        nameObj.name.toLowerCase().includes(term) ||
        (nameObj.meaning && nameObj.meaning.toLowerCase().includes(term))
      );
    }
    if (originTerm) {
      filtered = filtered.filter(nameObj =>
        (nameObj.origin && nameObj.origin.toLowerCase().includes(originTerm)) ||
        (nameObj.pronunciation && nameObj.pronunciation.toLowerCase().includes(originTerm))
      );
    }

    return filtered;
  }, [searchTerm, searchTermOrigin, genderFilter, activeTheme, allNames]);

  useEffect(() => {
    try {
      const namesCopy = { ...allNames };
      const uniqueNames = new Set();
      const discoverNames = [];

      Object.keys(namesCopy).forEach(category => {
        if (category !== 'Discover') {
          namesCopy[category].forEach(nameObj => {
            if (!uniqueNames.has(nameObj.name)) {
              uniqueNames.add(nameObj.name);
              discoverNames.push({ ...nameObj });
            }
          });
        }
      });

      namesCopy.Discover = discoverNames;
      setAllNames(namesCopy);
      setIsDiscoverPopulated(true);

      const initialNames = activeTheme === 'Discover' ? discoverNames : namesCopy[activeTheme] || [];
      setDisplayedNames(initialNames.slice(0, visibleCount));
    } catch (error) {
      console.error("Error initializing names:", error);
    }
  }, []);

  useEffect(() => {
    if (isDiscoverPopulated) {
      setDisplayedNames(filteredNames.slice(0, visibleCount));
    }
  }, [filteredNames, visibleCount, isDiscoverPopulated]);

  const loadMoreNames = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setIsLoading(false);
    }, 800);
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const toggleFavorite = (name) => {
    setFavorites(prev => prev.includes(name) ? prev.filter(fav => fav !== name) : [...prev, name]);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') setgeminiNames([]);
    setVisibleCount(15);
  };

  const handleOriginSearchChange = (e) => {
    setSearchTermOrigin(e.target.value);
    if (e.target.value.trim() === '') setgeminiNames([]);
    setVisibleCount(15);
  };

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    setSelectedName(null);
    setVisibleCount(15);
    setgeminiNames([]);
    setSearchTerm('');
    setSearchTermOrigin('');

    const filtered = allNames[theme] || [];
    setDisplayedNames(filtered.slice(0, 15));
  };

  const handleGenderFilterChange = (gender) => {
    setGenderFilter(gender);
    setVisibleCount(15);
  };

  const handleNameClick = (nameObj) => setSelectedName(nameObj);

  const closeNameDetails = () => setSelectedName(null);

  const spellName = (name) => {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const spelledName = [...name].join(' ') + '. ' + name;
    const utterance = new SpeechSynthesisUtterance(spelledName);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => { setIsSpeaking(false); console.error("Speech synthesis error"); };

    window.speechSynthesis.speak(utterance);
  };

  const fetchGeminiNames = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a name before searching.");
      return;
    }

    try {
      setIsLoadingGemini(true);
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchTerm.trim() }),
      });

      const result = await response.json();
      let parsed = result.data;
      if (typeof parsed === "string") parsed = JSON.parse(parsed);

      if (Array.isArray(parsed)) {
        setgeminiNames(parsed);
      } else {
        alert("No names found.");
      }
    } catch (error) {
      console.error("Failed to fetch from backend:", error);
      alert("Something went wrong");
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const hasMoreNames = filteredNames.length > displayedNames.length;

  return (
    <div className={`app-container ${isDarkMode ? "dark-mode" : ""}`}>
      <main className="main-content">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} activeTheme={activeTheme} />

        <div className="theme-selection">
          {["Discover", "Celestial", "Royal", "Mythical", "Hindi"].map(theme => (
            <button
              key={theme}
              className={`theme-button ${activeTheme === theme ? "active" : ""}`}
              onClick={() => handleThemeChange(theme)}
              aria-pressed={activeTheme === theme}
            >
              {theme}
            </button>
          ))}
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-main">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or meaning..."
                aria-label="Search names or meanings"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="search-secondary">
              <input
                type="text"
                className="search-input"
                placeholder="Search by origin..."
                aria-label="Search origins"
                value={searchTermOrigin}
                onChange={handleOriginSearchChange}
              />
            </div>
          </div>
          <button
            className="theme-button"
            onClick={fetchGeminiNames}
            disabled={!searchTerm}
          >
            Search with Gemini 🔮
          </button>
          <div className="gender-filter">
            <span className="filter-label">Filter by: </span>
            <div className="filter-buttons">
              {["all", "female", "male", "unisex"].map(gender => (
                <button
                  key={gender}
                  className={`gender-button ${genderFilter === gender ? 'active' : ''}`}
                  onClick={() => handleGenderFilterChange(gender)}
                  aria-pressed={genderFilter === gender}
                >
                  {gender === 'all' ? 'All' : gender === 'female' ? 'Girls' : gender === 'male' ? 'Boys' : 'Unisex'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <button
            className="theme-button"
            onClick={() => setShowFavoritesOnly(prev => !prev)}
          >
            {showFavoritesOnly ? 'Show All Names' : 'View Favorites ❤️'}
          </button>
        </div>

        {isLoadingGemini && (
          <div className="loader" style={{ color: isDarkMode ? "#ffffff" : "#222222" }}>
            ✨ Generating with Gemini...
          </div>
        )}

        {geminiNames.length > 0 && (
          <div style={{ margin: '30px 0' }}>
            <h2 style={{ textAlign: 'center' }}>✨ AI-Generated Names:</h2>
            <div className="name-cards-container">
              {geminiNames.map((nameObj, index) => (
                <div className={`name-card ${nameObj.gender?.toLowerCase() || ''}`} key={index}>
                  <div className="name-header">
                    <h2 className="name-title">{nameObj.name || 'Unnamed'} <span className="star-icon">✨</span></h2>
                  </div>
                  <div className="name-details">
                    <div className="name-detail"><span className="detail-icon">🔊</span><span className="detail-text">{nameObj.pronunciation || '—'}</span></div>
                    <div className="name-detail"><span className="detail-icon">📚</span><span className="detail-text">{nameObj.meaning || '—'}</span></div>
                    <div className="name-detail"><span className="detail-icon">🌐</span><span className="detail-text">{nameObj.origin || '—'}</span></div>
                    <div className="name-detail"><span className="detail-icon">⚧</span><span className="detail-text">{nameObj.gender || '—'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="name-cards-container">
          {showFavoritesOnly ? (
            favorites.length > 0 ? (
              favorites.map((favName, index) => {
                const nameObj = Object.values(allNames).flat().find(obj => obj.name === favName);
                return nameObj ? (
                  <NameCard
                    key={index}
                    nameObj={nameObj}
                    onClick={handleNameClick}
                    onSpell={spellName}
                    onFavorite={toggleFavorite}
                    isSpeaking={isSpeaking}
                    isFavorite={favorites.includes(nameObj.name)}
                  />
                ) : null;
              })
            ) : (
              <div className="no-results"><p>You have no favorites yet.</p></div>
            )
          ) : (
            displayedNames.length > 0 ? (
              displayedNames.map((nameObj, index) => (
                <NameCard
                  key={index}
                  nameObj={nameObj}
                  onClick={handleNameClick}
                  onSpell={spellName}
                  onFavorite={toggleFavorite}
                  isSpeaking={isSpeaking}
                  isFavorite={favorites.includes(nameObj.name)}
                />
              ))
            ) : (
              <div className="no-results"><p>No names found matching your search criteria.</p></div>
            )
          )}
        </div>

        {hasMoreNames && !showFavoritesOnly && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={loadMoreNames} disabled={isLoading}>
              {isLoading ? <span className="loading-spinner"></span> : `Load More (${filteredNames.length - displayedNames.length} remaining)`}
            </button>
          </div>
        )}

        <Suspense fallback={<div>Loading details...</div>}>
          {selectedName && (
            <NameModal
              selectedName={selectedName}
              closeModal={closeNameDetails}
              spellName={spellName}
              isSpeaking={isSpeaking}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;

import React from 'react';

const Header = ({ isDarkMode, toggleDarkMode, activeTheme }) => {
  // Update subtitle based on active theme
  const getThemeSubtitle = () => {
    try {
      switch(activeTheme) {
        case 'Celestial':
          return "Discover names written in the stars";
        case 'Royal':
          return "Majestic names fit for royalty";
        case 'Mythical':
          return "Names from legends and ancient tales";
        case 'Hindi':
          return "Beautiful traditional Hindi names";
        default:
          return "Explore our collection of unique names";
      }
    } catch (error) {
      console.error("Error in subtitle generation:", error);
      return "Explore our collection of unique names";
    }
  };

  return (
    <header className="celestial-header">
      <div className="header-highlight"></div>
      <h1 className="theme-title">{activeTheme ? `${activeTheme} Names` : 'Baby Names'}</h1>
      <p className="theme-subtitle">{getThemeSubtitle()}</p>
      <button 
        className="dark-mode-toggle" 
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span>{isDarkMode ? '☀️' : '🌙'}</span>
      </button>
    </header>
  );
};

export default Header;
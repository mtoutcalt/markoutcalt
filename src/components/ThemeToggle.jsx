import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      // Try to get the theme from localStorage, fallback to system preference, default to dark
      return localStorage.getItem('theme') || 
             (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    }
    return 'dark'; // Default to dark in SSR context
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Update data-theme attribute on html element
      root.setAttribute('data-theme', theme);
      
      // Add transition class to body
      document.body.classList.add('theme-transition');
      
      // Remove transition class after transition is complete
      const timer = setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 500);
      
      // Save theme preference to localStorage
      localStorage.setItem('theme', theme);
      
      return () => clearTimeout(timer);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-toggle-wrapper">
      <button 
        onClick={toggleTheme}
        className={`theme-toggle-switch ${theme}`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="toggle-track">
          <div className="toggle-icon sun-icon">
            ☀️
          </div>          
          <div className="toggle-thumb"></div>          
          <div className="toggle-icon moon-icon">
            🌙
          </div>
        </div>
      </button>
    </div>
  );
}
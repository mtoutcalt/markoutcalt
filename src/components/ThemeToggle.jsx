import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Initialize when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the current theme from the document
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme);
      setMounted(true);
    }
  }, []);

  // Don't render until component is mounted
  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Apply the theme change to the document
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save to localStorage for persistence
    localStorage.setItem('theme', newTheme);
    
    // Update component state
    setTheme(newTheme);
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
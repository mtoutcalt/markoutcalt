// This script initializes the theme on page load
// It should be placed in the head of the document to prevent FOUC (Flash of Unstyled Content)

(function() {
    // Try to get the theme from localStorage, fallback to system preference, default to dark
    function getInitialTheme() {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        return savedTheme;
      }
      
      // Check if the user prefers light mode at the OS level
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
      
      // Default to dark theme
      return 'dark';
    }
    
    // Apply the theme to the html element
    const theme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);
    
    // Listen for OS theme changes and update if the user hasn't set a preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only change theme automatically if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
        }
      });
    }
  })();
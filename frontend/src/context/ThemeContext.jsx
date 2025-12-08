import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Default to light mode if nothing is saved
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // If no preference saved, default to light mode
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Dark mode enabled');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Light mode enabled');
    }
  }, [isDark]);

  const toggleTheme = () => {
    console.log('Toggling theme from', isDark ? 'dark' : 'light', 'to', isDark ? 'light' : 'dark');
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

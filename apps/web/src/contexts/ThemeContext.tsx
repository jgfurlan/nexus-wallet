import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme options supported by the application.
 */
type Theme = 'light' | 'dark';

/**
 * ThemeContext properties explaining the active theme state and toggle callback.
 */
interface ThemeContextType {
  /** The current active theme ('light' or 'dark') */
  theme: Theme;
  /** Toggles the theme between light and dark modes */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider mounts the theme management context, reading the initial preference
 * from localStorage (defaulting to dark mode) and syncing changes with the DOM attribute.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Dark is default
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the ThemeContext properties (current theme, toggle function).
 * 
 * @returns The ThemeContext properties.
 * @throws {Error} If used outside of a ThemeProvider wrapper.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

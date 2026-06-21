import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/** Contexto de tema (claro/escuro) para toda a aplicação. */
interface ThemeContextType {
  /** Tema atual: 'light' | 'dark' */
  theme: Theme;
  /** Alterna entre tema claro e escuro. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider do tema que persiste a preferência no localStorage
 * e define o atributo `data-theme` no `<html>`.
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
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
 * Hook para acessar o tema atual e a função de alternância.
 * Deve ser usado dentro de um <ThemeProvider>.
 *
 * @throws {Error} Se usado fora de um ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

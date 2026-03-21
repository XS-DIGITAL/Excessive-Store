import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

type Theme = 'light' | 'dark';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  settings: ThemeSettings;
}

const defaultSettings: ThemeSettings = {
  primaryColor: '#6c0094',
  secondaryColor: '#4a0066',
  accentColor: '#f5a8ff',
  fontFamily: 'Inter'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('lookoutpost_theme');
    return (saved as Theme) || 'dark';
  });
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  useEffect(() => {
    // Apply initial defaults
    const root = document.documentElement;
    root.style.setProperty('--brand-green', settings.primaryColor);
    root.style.setProperty('--brand-green-dark', settings.secondaryColor);
    root.style.setProperty('--brand-orange', settings.accentColor);
    root.style.setProperty('--font-sans', settings.fontFamily + ', ui-sans-serif, system-ui, sans-serif');

    const unsub = onSnapshot(doc(db, 'settings', 'theme'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newSettings = {
          primaryColor: data.primaryColor || defaultSettings.primaryColor,
          secondaryColor: data.secondaryColor || defaultSettings.secondaryColor,
          accentColor: data.accentColor || defaultSettings.accentColor,
          fontFamily: data.fontFamily || defaultSettings.fontFamily
        };
        setSettings(newSettings);
        
        // Apply to CSS variables
        root.style.setProperty('--brand-green', newSettings.primaryColor);
        root.style.setProperty('--brand-green-dark', newSettings.secondaryColor);
        root.style.setProperty('--brand-orange', newSettings.accentColor);
        root.style.setProperty('--font-sans', newSettings.fontFamily + ', ui-sans-serif, system-ui, sans-serif');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('lookoutpost_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, settings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

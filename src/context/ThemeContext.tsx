import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const saved = localStorage.getItem('excessive_store_theme_mode');
    return (saved as Theme) || 'dark';
  });
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('excessive_store_theme');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    // Apply initial defaults
    const root = document.documentElement;
    root.style.setProperty('--brand-green', settings.primaryColor);
    root.style.setProperty('--brand-green-dark', settings.secondaryColor);
    root.style.setProperty('--brand-orange', settings.accentColor);
    root.style.setProperty('--font-sans', settings.fontFamily + ', ui-sans-serif, system-ui, sans-serif');

    // Listen for theme updates (from Admin panel)
    const handleThemeUpdate = () => {
      const saved = localStorage.getItem('excessive_store_theme');
      if (saved) {
        const newSettings = JSON.parse(saved);
        setSettings(newSettings);
        root.style.setProperty('--brand-green', newSettings.primaryColor);
        root.style.setProperty('--brand-green-dark', newSettings.secondaryColor);
        root.style.setProperty('--brand-orange', newSettings.accentColor);
        root.style.setProperty('--font-sans', newSettings.fontFamily + ', ui-sans-serif, system-ui, sans-serif');
      }
    };

    window.addEventListener('storage', (e) => {
      if (e.key === 'excessive_store_theme') handleThemeUpdate();
    });
    
    return () => window.removeEventListener('storage', handleThemeUpdate);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('excessive_store_theme_mode', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
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

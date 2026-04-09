import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SoundType, ThemeSettings } from '@/types';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface ThemeContextType {
  theme: ThemeSettings;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  
  sound: {
    type: SoundType;
    volume: number;
    isPlaying: boolean;
  };
  setSoundType: (type: SoundType) => void;
  setSoundVolume: (volume: number) => void;
  toggleSound: () => void;
  stopSound: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'focustrack_theme';
const SOUND_KEY = 'focustrack_sound';

const ACCENT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: 'light',
    accentColor: '#3b82f6',
    fontSize: 'medium',
  });

  const [sound, setSound] = useState({
    type: 'none' as SoundType,
    volume: 50,
    isPlaying: false,
  });

  // Load saved settings
  useEffect(() => {
    const themeData = safeGetItem<ThemeSettings>(THEME_KEY, {
      mode: 'light',
      accentColor: '#3b82f6',
      fontSize: 'medium',
    });
    const soundData = safeGetItem<{ type: SoundType; volume: number; isPlaying: boolean }>(SOUND_KEY, {
      type: 'none',
      volume: 50,
      isPlaying: false,
    });

    setTheme(themeData);
    setSound(soundData);
  }, []);

  // Save settings
  useEffect(() => {
    safeSetItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    safeSetItem(SOUND_KEY, sound);
  }, [sound]);

  // Apply dark mode
  useEffect(() => {
    const isDarkMode = theme.mode === 'dark' || 
      (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accent color
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme.mode]);

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setTheme(prev => ({ ...prev, mode }));
  };

  const setAccentColor = (color: string) => {
    setTheme(prev => ({ ...prev, accentColor: color }));
  };

  const setFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setTheme(prev => ({ ...prev, fontSize }));
  };

  const isDark = theme.mode === 'dark' || 
    (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleDarkMode = () => {
    setTheme(prev => ({ 
      ...prev, 
      mode: isDark ? 'light' : 'dark' 
    }));
  };

  // Sound functions (mock - in real app would use Web Audio API)
  const setSoundType = (type: SoundType) => {
    setSound(prev => ({ ...prev, type }));
  };

  const setSoundVolume = (volume: number) => {
    setSound(prev => ({ ...prev, volume }));
  };

  const toggleSound = () => {
    setSound(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const stopSound = () => {
    setSound(prev => ({ ...prev, isPlaying: false }));
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setThemeMode,
      setAccentColor,
      setFontSize,
      isDark,
      toggleDarkMode,
      sound,
      setSoundType,
      setSoundVolume,
      toggleSound,
      stopSound,
    }}>
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

export { ACCENT_COLORS };

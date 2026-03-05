/**
 * ThemeSwitcher - Surface Switcher Component
 *
 * Cycles through surfaces: dark → green → light → dark
 *
 * Theme definitions:
 * - dark: black bg, white/gray borders and text
 * - green: black bg, green borders and text
 * - light: white bg, black borders and text
 */

import { useState, useEffect } from 'react';
import { Moon, Leaf, Sun } from 'lucide-react';
import './ThemeSwitcher.css';

type SurfaceId = 'dark' | 'green' | 'light';

interface ThemeConfig {
  icon: typeof Moon;
  label: string;
}

const themeConfigs: Record<SurfaceId, ThemeConfig> = {
  dark: { icon: Moon, label: 'Dark' },
  green: { icon: Leaf, label: 'Green' },
  light: { icon: Sun, label: 'Light' },
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<SurfaceId>(() => {
    const saved = localStorage.getItem('lumos-theme');
    return (saved as SurfaceId) || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumos-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev =>
      prev === 'dark' ? 'green' : prev === 'green' ? 'light' : 'dark'
    );
  };

  const config = themeConfigs[theme];
  const Icon = config.icon;

  return (
    <button
      className={`theme-switcher theme-switcher--${theme}`}
      onClick={cycleTheme}
      title={`Current: ${config.label}. Click to change.`}
      aria-label={`Switch theme (current: ${config.label})`}
    >
      <Icon size={16} />
    </button>
  );
}

export default ThemeSwitcher;

/**
 * LanguageSwitcher - Cycles through available languages (EN/FR/ES/DE)
 *
 * Pattern mirroring ThemeSwitcher:
 * - Persists to localStorage
 * - Sets data-language attribute on documentElement
 * - Uses flagcdn.com for SVG flag images (no npm dependency required)
 * - Auto-detects browser language on first visit
 */

import { useState, useEffect } from 'react';
import './LanguageSwitcher.css';

export type Language = 'en' | 'fr';

interface LanguageConfig {
  label: string;
  nativeName: string;
}

const languageConfigs: Record<Language, LanguageConfig> = {
  en: { label: 'EN', nativeName: 'English' },
  fr: { label: 'FR', nativeName: 'Français' },
};

const STORAGE_KEY = 'lumos-language';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr'];

/**
 * Detect browser language from navigator.language
 */
function getBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  return 'en';
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';

    // Check localStorage for user preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in languageConfigs) {
      return saved as Language;
    }

    // First visit: detect browser language
    return getBrowserLanguage();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-language', language);
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  const config = languageConfigs[language];

  return (
    <button
      className="language-switcher"
      onClick={toggleLanguage}
      title={`${config.nativeName} - Click to change`}
      aria-label={`Current language: ${config.nativeName}. Click to switch.`}
    >
      <span className="language-label">{config.label}</span>
    </button>
  );
}

export default LanguageSwitcher;
